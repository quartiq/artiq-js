package proxy

import (
	"bufio"
	"context"
	"log"
	"net"
	"net/http"
	"time"

	"github.com/coder/websocket"
)

func listenWsServeTcp(wsConn *websocket.Conn, tcpConn net.Conn) error {
	for {
		_, msg, err := wsConn.Read(context.Background())
		if err != nil {
			status := websocket.CloseStatus(err)
			if status == websocket.StatusNormalClosure || status == websocket.StatusGoingAway {
				return nil
			}
			return err
		}

		if _, err = tcpConn.Write(msg); err != nil {
			return err
		}
	}
}

func listenTcpServeWs(tcpConn net.Conn, wsConn *websocket.Conn) error {
	reader := bufio.NewReader(tcpConn)

	for {
		msg, err := reader.ReadBytes('\n')
		if err != nil {
			return err
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		err = wsConn.Write(ctx, websocket.MessageText, msg)
		cancel()

		if err != nil {
			return err
		}
	}
}

func bridge(wsConn *websocket.Conn, tcpConn net.Conn) error {
	done := make(chan error, 2)

	go func() {
		done <- listenWsServeTcp(wsConn, tcpConn)
	}()

	go func() {
		done <- listenTcpServeWs(tcpConn, wsConn)
	}()

	err := <-done

	// Unblock the remaining forwarding loop
	tcpConn.Close()

	if err == nil {
		wsConn.Close(websocket.StatusNormalClosure, "")
	} else {
		wsConn.Close(websocket.StatusInternalError, "proxy connection failed")
	}

	// Ensure both forwarding loops have terminated
	<-done

	return err
}

func HandlerFunc(w http.ResponseWriter, r *http.Request) {
	tcpConn, err := net.Dial("tcp", r.URL.Path[len("/proxy/"):])
	if err != nil {
		log.Print(err)
		http.Error(w, "backend connection failed", http.StatusBadGateway)
		return
	}
	defer tcpConn.Close()

	wsConn, err := websocket.Accept(w, r, nil)
	if err != nil {
		log.Printf("ws accept err: %v", err)
		return
	}
	defer wsConn.CloseNow()

	if err := bridge(wsConn, tcpConn); err != nil {
		log.Printf("proxy fwd err: %v", err)
	}
}

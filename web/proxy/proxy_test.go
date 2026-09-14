// made by codex

package proxy

import (
	"context"
	"errors"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/coder/websocket"
)

const testTimeout = 2 * time.Second

type acceptResult struct {
	conn net.Conn
	err  error
}

type fixture struct {
	backend net.Conn
	client  *websocket.Conn
}

func newFixture(t *testing.T) fixture {
	t.Helper()

	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		listener.Close()
	})

	accepted := make(chan acceptResult, 1)
	go func() {
		conn, err := listener.Accept()
		accepted <- acceptResult{conn, err}
	}()

	server := httptest.NewServer(http.HandlerFunc(HandlerFunc))
	t.Cleanup(server.Close)

	url := "ws" +
		strings.TrimPrefix(server.URL, "http") +
		"/proxy/" +
		listener.Addr().String()

	ctx, cancel := context.WithTimeout(context.Background(), testTimeout)
	client, _, err := websocket.Dial(ctx, url, nil)
	cancel()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		client.CloseNow()
	})

	var backend net.Conn
	select {
	case result := <-accepted:
		if result.err != nil {
			t.Fatal(result.err)
		}
		backend = result.conn

	case <-time.After(testTimeout):
		t.Fatal("proxy did not connect to backend")
	}

	t.Cleanup(func() {
		backend.Close()
	})

	return fixture{
		backend: backend,
		client:  client,
	}
}

func TestForwardsInBothDirections(t *testing.T) {
	f := newFixture(t)

	toBackend := []byte("browser to backend\n")

	ctx, cancel := context.WithTimeout(context.Background(), testTimeout)
	defer cancel()

	if err := f.client.Write(ctx, websocket.MessageText, toBackend); err != nil {
		t.Fatal(err)
	}

	if err := f.backend.SetReadDeadline(time.Now().Add(testTimeout)); err != nil {
		t.Fatal(err)
	}

	received := make([]byte, len(toBackend))
	if _, err := io.ReadFull(f.backend, received); err != nil {
		t.Fatal(err)
	}

	if string(received) != string(toBackend) {
		t.Fatalf("backend received %q, want %q", received, toBackend)
	}

	toBrowser := []byte("backend to browser\n")
	if _, err := f.backend.Write(toBrowser); err != nil {
		t.Fatal(err)
	}

	messageType, received, err := f.client.Read(ctx)
	if err != nil {
		t.Fatal(err)
	}

	if messageType != websocket.MessageText {
		t.Fatalf("received message type %v, want text", messageType)
	}

	if string(received) != string(toBrowser) {
		t.Fatalf("browser received %q, want %q", received, toBrowser)
	}
}

func TestBackendDisconnectClosesWebSocketWithError(t *testing.T) {
	f := newFixture(t)

	if err := f.backend.Close(); err != nil {
		t.Fatal(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), testTimeout)
	defer cancel()

	_, _, err := f.client.Read(ctx)
	if err == nil {
		t.Fatal("WebSocket remained open")
	}

	if status := websocket.CloseStatus(err); status != websocket.StatusInternalError {
		t.Fatalf(
			"got WebSocket close status %v, want %v: %v",
			status,
			websocket.StatusInternalError,
			err,
		)
	}
}

func TestWebSocketDisconnectClosesBackend(t *testing.T) {
	f := newFixture(t)

	if err := f.client.CloseNow(); err != nil {
		t.Fatal(err)
	}

	if err := f.backend.SetReadDeadline(time.Now().Add(testTimeout)); err != nil {
		t.Fatal(err)
	}

	_, err := f.backend.Read(make([]byte, 1))
	if err == nil {
		t.Fatal("backend connection remained readable")
	}

	var netErr net.Error
	if errors.As(err, &netErr) && netErr.Timeout() {
		t.Fatal("backend connection remained open")
	}
}

func TestBackendDialFailureRejectsWebSocketHandshake(t *testing.T) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}

	target := listener.Addr().String()
	if err := listener.Close(); err != nil {
		t.Fatal(err)
	}

	server := httptest.NewServer(http.HandlerFunc(HandlerFunc))
	t.Cleanup(server.Close)

	url := "ws" +
		strings.TrimPrefix(server.URL, "http") +
		"/proxy/" +
		target

	ctx, cancel := context.WithTimeout(context.Background(), testTimeout)
	defer cancel()

	client, resp, err := websocket.Dial(ctx, url, nil)
	if client != nil {
		defer client.CloseNow()
	}
	if err == nil {
		t.Fatal("expected WebSocket handshake to fail")
	}
	if resp == nil {
		t.Fatal("expected an HTTP response")
	}
	if resp.StatusCode != http.StatusBadGateway {
		t.Fatalf("expected HTTP 502, got %d", resp.StatusCode)
	}
}

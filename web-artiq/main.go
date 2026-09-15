package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"web-artiq/proxy"
)

var tmpl = template.Must(template.New("view").Parse(`
	<!DOCTYPE html>
	<html>
		<head>
			{{ if .Styled }}
			<link href="/static/{{ .Curr }}.css" rel="stylesheet">
			{{ end }}
		</head>
		<body>
			<nav>
				<span>Available views:</span>
				{{ range .Views }}
				<a href="/{{ . }}">{{ . }}</a>
				{{ end }}
			</nav>
			<script type="module" src="/static/{{ .Curr }}.js"></script>
		</body>
	</html>
`))

func views() []string {
	var all []string
	entries, err := os.ReadDir("src")
	if err != nil {
		return all
	}

	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".ts" {
			continue
		}

		name := strings.TrimSuffix(entry.Name(), ".ts")
		all = append(all, name)
	}

	return all
}

func styled(view string) bool {
	_, err := os.Stat(filepath.Join("src", view+".css"))
	return err == nil
}

func viewHandler(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Path[1:]

	err := tmpl.Execute(w, struct {
		Views  []string
		Curr   string
		Styled bool
	}{views(), name, styled(name)})

	if err != nil {
		log.Printf("render view %v: %v", name, err)
	}
}

func fileHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, r.URL.Path[1:])
}

func whitelist() []string {
	wlPath := flag.String("whitelist", "", "")
	flag.Parse()

	list := []string{}

	if *wlPath == "" {
		return list
	}

	j, err := os.ReadFile(*wlPath)
	if err != nil {
		return list
	}

	json.Unmarshal([]byte(j), &list)
	return list
}

func main() {
	wl := whitelist()
	args := flag.Args()

	http.HandleFunc("/", viewHandler)
	http.HandleFunc("/static/", fileHandler)
	http.HandleFunc("/proxy/", func(w http.ResponseWriter, r *http.Request) {
		if !slices.Contains(wl, r.URL.Path[len("/proxy/"):]) {
			w.WriteHeader(403)
			w.Write([]byte("403 - Forbidden\n"))
			return
		}

		proxy.HandlerFunc(w, r)
	})

	if len(args) < 1 {
		fmt.Println("missing URI argument")
		return
	}

	log.Printf("Listening at http://%s", args[0])
	log.Fatal(http.ListenAndServe(args[0], nil))
}

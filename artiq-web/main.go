package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
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

func main() {
	args := os.Args[1:]

	if len(args) < 1 {
		fmt.Println("missing URI argument")
		return
	}

	http.HandleFunc("/", viewHandler)
	http.HandleFunc("/static/", fileHandler)

	log.Printf("Listening at http://%s", args[0])
	log.Fatal(http.ListenAndServe(args[0], nil))
}

package main

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"text/template"
)

type MyHandler func(http.ResponseWriter, *http.Request)

func (h MyHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	h(w, r)
}

func main() {
	fs := MyHandler(func(w http.ResponseWriter, r *http.Request) {
		http.FileServer(http.Dir("static"))
		fmt.Println(r.Method)
		fmt.Println(r.URL.Path)
		fmt.Println(r.Header)
		fmt.Println(r.RemoteAddr)
	})

	http.Handle("/static/", http.StripPrefix("/static/", fs))

	http.HandleFunc("/", serveTemplate)

	log.Println("Listening...")
	http.ListenAndServe(":3000", nil)
}

func serveTemplate(w http.ResponseWriter, r *http.Request) {
	lp := filepath.Join("templates", "layout.html")
	println(r.URL.Path)
	fp := filepath.Join("templates", "example.html")

	tmpl := template.Must(template.ParseFiles(lp, fp))
	tmpl.ExecuteTemplate(w, "layout", nil)
}

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

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func main() {
	requestCounter := 0
	handler := MyHandler(func(w http.ResponseWriter, r *http.Request) {
		// fmt.Println(r.Method)
		// fmt.Println(r.URL.Path)
		// fmt.Println(r.Header)
		// fmt.Println(r.RemoteAddr)
		requestCounter++
		fmt.Println("Request #", requestCounter)
		enableCors(&w)
		http.FileServer(http.Dir("static")).ServeHTTP(w, r)
	})

	http.Handle("/static/", http.StripPrefix("/static/", handler))

	http.HandleFunc("/", serveTemplate)

	log.Println("Listening on :3000")
	http.ListenAndServe(":3000", nil)
}

func serveTemplate(w http.ResponseWriter, r *http.Request) {
	lp := filepath.Join("templates", "layout.html")
	println(r.URL.Path)
	fp := filepath.Join("templates", "example.html")

	tmpl := template.Must(template.ParseFiles(lp, fp))
	tmpl.ExecuteTemplate(w, "layout", nil)
}

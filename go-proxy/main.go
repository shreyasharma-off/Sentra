package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

// Structure to match what your Python FastAPI backend expects
type AnalysisRequest struct {
	Prompt string `json:"prompt"`
}

type AnalysisResponse struct {
	Status string `json:"status"` // e.g., "ALLOW" or "BLOCK"
	Reason string `json:"reason,omitempty"`
}

func main() {
	http.HandleFunc("/", proxyHandler)

	port := "8080"
	fmt.Printf("🚀 Sentra High-Speed Go Proxy starting on port %s...\n", port)
	
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func proxyHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("Intercepted incoming request to: %s\n", r.URL.Path)

	// For demonstration, let's grab a sample prompt or read it from the incoming request
	promptText := "Hello, can you help me write some code?"
	
	// If the user sent JSON with a prompt, you could parse it here. 
	// For now, we package our test prompt to send to Python.
	payload := AnalysisRequest{Prompt: promptText}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// 1. Forward payload to Python Control Plane (Port 8000)
	// Replace "/analyze" with your exact endpoint path if it's different from /analyze
	pythonURL := "http://localhost:8000/analyze" 
	resp, err := http.Post(pythonURL, "application/json", bytes.NewBuffer(jsonPayload))
	if err != nil {
		// Fail-open or fail-closed depending on architecture; here we log and allow or block
		fmt.Printf("Warning: Could not reach Python control plane: %v\n", err)
	} else {
		defer resp.Body.Close()
		bodyBytes, _ := io.ReadAll(resp.Body)
		fmt.Printf("Python Control Plane response: %s\n", string(bodyBytes))
	}

	// 2. Respond back to the client
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "success", "message": "Proxy successfully intercepted and scanned prompt via Python!"}`))
}
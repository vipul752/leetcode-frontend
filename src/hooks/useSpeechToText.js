import { useRef, useState, useCallback } from "react";

export const useSpeechToText = (onResult, onError) => {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const errorMsg =
        "Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.";
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      alert(errorMsg);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log("🎤 Listening started...");
        setIsListening(true);
      };

      recognition.onresult = (e) => {
        if (e.results && e.results[0]) {
          const transcript = e.results[0][0].transcript;
          console.log("✅ Transcript:", transcript);
          if (onResult) onResult(transcript);
        }
      };

      recognition.onerror = (e) => {
        console.error("❌ Speech recognition error:", e.error);
        let errorMsg = `Speech error: ${e.error}`;

        switch (e.error) {
          case "network":
            errorMsg = "Network error. Please check your internet connection.";
            break;
          case "no-speech":
            errorMsg = "No speech detected. Please speak louder.";
            break;
          case "audio-capture":
            errorMsg = "Microphone not found. Please check your device.";
            break;
          case "not-allowed":
            errorMsg =
              "Microphone permission denied. Allow access in browser settings.";
            break;
          default:
            errorMsg = `Speech recognition error: ${e.error}`;
        }

        if (onError) onError(errorMsg);
      };

      recognition.onend = () => {
        console.log("⏹️ Listening stopped");
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      const errorMsg = `Failed to start speech recognition: ${err.message}`;
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      setIsListening(false);
    }
  }, [onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return { startListening, stopListening, isListening };
};

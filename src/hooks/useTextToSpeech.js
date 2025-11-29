export const useTextToSpeech = () => {
  const speak = (text, onEnd = null) => {
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.pitch = 1.1;
    utter.rate = 0.9;
    utter.volume = 1;

    // Try to use Google voice for more natural sound
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const googleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("google") ||
          v.name.includes("Samantha") ||
          v.name.includes("Victoria")
      );
      if (googleVoice) {
        utter.voice = googleVoice;
        console.log("🎙️ Using voice:", googleVoice.name);
      }
    }

    if (onEnd) {
      utter.onend = onEnd;
    }

    window.speechSynthesis.speak(utter);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
  };

  return { speak, stop };
};

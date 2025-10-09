import { useRef } from 'react';

const useKeyboardSound = () => {
  const audioContextRef = useRef(null);

  const playRandomKeyStrokeSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Random frequency between 800-1200 Hz for variety
      const frequency = 800 + Math.random() * 400;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

      // Quick attack and decay
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silently fail if audio context is not supported
      console.warn('Audio context not supported:', error);
    }
  };

  return {
    playRandomKeyStrokeSound,
  };
};

export default useKeyboardSound;

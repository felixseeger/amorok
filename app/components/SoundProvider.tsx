
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';

// Sound Context
type SoundContextType = {
    isPlaying: boolean;
    toggleSound: () => void;
    playHover: () => void;
    playClick: () => void;
};

const SoundContext = createContext<SoundContextType>({
    isPlaying: false,
    toggleSound: () => { },
    playHover: () => { },
    playClick: () => { },
});

export const useSound = () => useContext(SoundContext);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const ambientRef = useRef<HTMLAudioElement | null>(null);

    // We'll use Web Audio API for simple UI sounds to avoid loading files for now, 
    // or we could use minimal encoded strings. 
    // For "Sound Design", meaningful assets sort of assume files, but let's try a synth approach for immediate feedback.
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Initialize Audio Context on user interaction (handled by toggle usually)
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass();
            }
        }

        // Setup Ambient Track (Placeholder URL)
        // Ideally user provides an asset. We will comment this out or use a reliable free asset.
        // For now, let's just create the architecture.
        // ambientRef.current = new Audio('/sounds/ambient-drone.mp3'); 
        // ambientRef.current.loop = true;
    }, []);

    const toggleSound = () => {
        const newState = !isPlaying;
        setIsPlaying(newState);

        if (newState) {
            audioContextRef.current?.resume();
            ambientRef.current?.play().catch(e => console.log("Audio play failed", e));
        } else {
            ambientRef.current?.pause();
        }
    };

    const playHover = () => {
        if (!isPlaying || !audioContextRef.current) return;

        // Simple high-pitch blip for hover
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();

        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioContextRef.current.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioContextRef.current.currentTime + 0.05);

        gain.gain.setValueAtTime(0.05, audioContextRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.05);

        osc.start();
        osc.stop(audioContextRef.current.currentTime + 0.05);
    };

    const playClick = () => {
        if (!isPlaying || !audioContextRef.current) return;

        // Lower pitch thud for click
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();

        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, audioContextRef.current.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioContextRef.current.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.1);

        osc.start();
        osc.stop(audioContextRef.current.currentTime + 0.1);
    };

    return (
        <SoundContext.Provider value={{ isPlaying, toggleSound, playHover, playClick }}>
            {children}
        </SoundContext.Provider>
    );
};

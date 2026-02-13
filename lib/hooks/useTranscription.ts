'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useTranscription(enabled: boolean) {
    const [transcript, setTranscript] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const recognitionRef = useRef<any>(null);

    const stopRecognition = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.onresult = null;
                recognitionRef.current.onend = null;
                recognitionRef.current.stop();
            } catch (e) {
                // Ignore stop errors
            }
            recognitionRef.current = null;
        }
        setIsProcessing(false);
    }, []);

    const startRecognition = useCallback(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition API not supported in this browser.');
            return;
        }

        if (recognitionRef.current) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsProcessing(true);
        };

        recognition.onresult = (event: any) => {
            // Only take the very last result segment to keep it to one line
            // and avoid accumulating historical text which causes lag
            const latestResultIndex = event.results.length - 1;
            const latestResult = event.results[latestResultIndex];

            if (latestResult && latestResult[0]) {
                const text = latestResult[0].transcript.trim();
                setTranscript(text);
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'no-speech' || event.error === 'aborted') {
                return;
            }
            console.error('Speech recognition error', event.error);
            stopRecognition();
        };

        recognition.onend = () => {
            if (enabled && recognitionRef.current) {
                try {
                    recognition.start();
                } catch (e) {
                    // Ignore start errors if already started
                }
            } else {
                setIsProcessing(false);
            }
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
        } catch (e) {
            console.error('Error starting recognition:', e);
        }
    }, [enabled, stopRecognition]);

    useEffect(() => {
        if (enabled) {
            startRecognition();
        } else {
            stopRecognition();
            setTranscript('');
        }

        return () => {
            stopRecognition();
        };
    }, [enabled, startRecognition, stopRecognition]);

    return { transcript, isProcessing };
}

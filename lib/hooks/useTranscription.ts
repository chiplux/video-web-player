'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useTranscription(enabled: boolean) {
    const [transcript, setTranscript] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const recognitionRef = useRef<any>(null);

    const stopRecognition = useCallback(() => {
        if (recognitionRef.current) {
            try {
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
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setTranscript(finalTranscript);
            } else {
                const results = event.results;
                const last = results[results.length - 1];
                if (last && last[0]) {
                    setTranscript(last[0].transcript);
                }
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            if (event.error === 'no-speech' || event.error === 'aborted') {
                return;
            }
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
            setTranscript((prev) => prev === '' ? prev : '');
        }

        return () => {
            stopRecognition();
        };
    }, [enabled, startRecognition, stopRecognition]);

    return { transcript, isProcessing };
}

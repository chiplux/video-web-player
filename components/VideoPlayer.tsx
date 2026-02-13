'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranscription } from '@/lib/hooks/useTranscription';

interface VideoPlayerProps {
    src: string;
    title: string;
    subtitleSrc?: string;
    onEnded?: () => void;
}

export default function VideoPlayer({ src, title, subtitleSrc, onEnded }: VideoPlayerProps) {
    const [isHovering, setIsHovering] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const [aiEnabled, setAiEnabled] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const { transcript, isProcessing } = useTranscription(aiEnabled);

    // Auto-disable AI if user switches to a video with real subtitles
    useEffect(() => {
        if (subtitleSrc) {
            setAiEnabled(false);
        }
    }, [subtitleSrc]);

    const toggleAI = () => {
        if (subtitleSrc) return;
        setAiEnabled(!aiEnabled);
    };

    const togglePictureInPicture = async () => {
        if (!videoRef.current) return;
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (document.pictureInPictureEnabled) {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (error) {
            console.error('PiP failed:', error);
        }
    };

    return (
        <div
            className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group shadow-2xl border border-white/5"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <video
                ref={videoRef}
                src={src}
                controls
                autoPlay={autoPlay}
                onEnded={onEnded}
                className="w-full h-full"
            >
                {subtitleSrc && (
                    <track
                        kind="subtitles"
                        src={subtitleSrc}
                        srcLang="en"
                        label="English"
                        default
                    />
                )}
            </video>

            {/* Title Overlay */}
            <div className={`absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex justify-between items-start">
                    <h2 className="text-white text-xl font-bold truncate pr-4">
                        {title}
                    </h2>

                    <div className="flex items-center gap-3">
                        {/* AI Subtitles Toggle */}
                        <button
                            onClick={toggleAI}
                            disabled={!!subtitleSrc}
                            aria-label="Toggle AI Subtitles"
                            className={`p-2 backdrop-blur-md rounded-full border transition-all ${aiEnabled
                                ? 'bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                                : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:bg-black/60'
                                } ${!!subtitleSrc ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title={subtitleSrc ? "Real subtitles available" : "Live AI Subtitles (Browser)"}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                        </button>

                        {/* PiP Button */}
                        <button
                            onClick={togglePictureInPicture}
                            aria-label="Toggle Picture-in-Picture"
                            className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-gray-400 hover:text-white hover:bg-black/60 transition-all"
                            title="Always on top (PiP)"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                            </svg>
                        </button>

                        {/* Auto-play Switch */}
                        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Auto-play</span>
                            <button
                                onClick={() => setAutoPlay(!autoPlay)}
                                aria-label="Toggle auto-play"
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${autoPlay ? 'bg-white' : 'bg-gray-700'}`}
                            >
                                <span
                                    className={`inline-block h-3 w-3 transform rounded-full transition-transform duration-200 ${autoPlay ? 'translate-x-5 bg-black' : 'translate-x-1 bg-gray-300'}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Transcript Overlay */}
            {aiEnabled && (
                <div className="absolute bottom-16 left-0 w-full flex justify-center px-8 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/20 px-6 py-2.5 rounded-full shadow-2xl max-w-[90%] min-w-[200px] text-center animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                        {isProcessing && !transcript ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                <span className="text-gray-300 text-xs font-medium uppercase tracking-wider">Listening...</span>
                            </div>
                        ) : transcript ? (
                            <p className="text-white text-base font-semibold truncate px-2 drop-shadow-md">
                                {transcript}
                            </p>
                        ) : (
                            <span className="text-gray-400 text-xs italic">Initializing AI...</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

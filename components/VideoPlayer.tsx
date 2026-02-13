'use client';

import { useState, useRef } from 'react';

interface VideoPlayerProps {
    src: string;
    title: string;
    subtitleSrc?: string;
    onEnded?: () => void;
}

export default function VideoPlayer({ src, title, subtitleSrc, onEnded }: VideoPlayerProps) {
    const [isHovering, setIsHovering] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

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
    );
}

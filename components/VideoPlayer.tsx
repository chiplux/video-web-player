'use client';

import { useState, useRef } from 'react';

interface VideoPlayerProps {
    src: string;
    title: string;
    subtitleSrc?: string;
}

export default function VideoPlayer({ src, title, subtitleSrc }: VideoPlayerProps) {
    const [isHovering, setIsHovering] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <div
            className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <video
                ref={videoRef}
                src={src}
                controls
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
            <div className={`absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                <h2 className="text-white text-xl font-bold truncate">
                    {title}
                </h2>
            </div>
        </div>
    );
}

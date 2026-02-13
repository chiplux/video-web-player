'use client';

import { useState, useEffect } from 'react';
import { Tutorial, VideoFile } from '@/lib/video';

interface TutorialListProps {
    tutorials: Tutorial[];
    selectedVideo: VideoFile | null;
    onSelectVideo: (video: VideoFile) => void;
}

export default function TutorialList({ tutorials, selectedVideo, onSelectVideo }: TutorialListProps) {
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

    // Auto-expand folder when a video is selected (e.g., initial load)
    useEffect(() => {
        if (selectedVideo && selectedVideo.folder) {
            const parentFolder = selectedVideo.path.split('/')[0];
            setExpandedFolders(prev => ({ ...prev, [parentFolder]: true }));
        }
    }, [selectedVideo]);

    const toggleFolder = (folderName: string) => {
        setExpandedFolders(prev => ({
            ...prev,
            [folderName]: !prev[folderName]
        }));
    };

    return (
        <div className="w-full h-full overflow-y-auto space-y-1 pt-4">
            {tutorials.map((tutorial) => {
                const isExpanded = !!expandedFolders[tutorial.name];

                return (
                    <div key={tutorial.name} className="border-b border-white/5 last:border-0">
                        <button
                            onClick={() => toggleFolder(tutorial.name)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors group"
                        >
                            <h3 className={`text-sm font-medium transition-colors ${isExpanded ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                {tutorial.name}
                            </h3>
                            <svg
                                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-white' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <ul className="py-2 space-y-1 bg-black/20">
                                {tutorial.videos.map((video) => (
                                    <li key={video.path} className="px-2">
                                        <button
                                            onClick={() => onSelectVideo(video)}
                                            className={`w-full text-left px-6 py-2 rounded-md transition-all text-xs ${selectedVideo?.path === video.path
                                                    ? 'bg-white/10 text-white font-medium border-l-2 border-white'
                                                    : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <span className="truncate block">
                                                {video.name.replace(/\.[^/.]+$/, "")}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                                {tutorial.videos.length === 0 && (
                                    <li className="px-8 py-2 text-xs text-gray-600 italic">
                                        No videos found
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

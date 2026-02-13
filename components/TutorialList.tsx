'use client';

import { useState, useEffect } from 'react';
import { Folder, VideoFile } from '@/lib/video';

interface TutorialListProps {
    tutorials: Folder[];
    selectedVideo: VideoFile | null;
    onSelectVideo: (video: VideoFile) => void;
}

export default function TutorialList({ tutorials, selectedVideo, onSelectVideo }: TutorialListProps) {
    return (
        <div className="w-full h-full overflow-y-auto space-y-1 pt-4 pb-20">
            {tutorials.map((folder) => (
                <RecursiveFolder
                    key={folder.path}
                    folder={folder}
                    selectedVideo={selectedVideo}
                    onSelectVideo={onSelectVideo}
                    depth={0}
                />
            ))}
        </div>
    );
}

interface RecursiveFolderProps {
    folder: Folder;
    selectedVideo: VideoFile | null;
    onSelectVideo: (video: VideoFile) => void;
    depth: number;
}

function RecursiveFolder({ folder, selectedVideo, onSelectVideo, depth }: RecursiveFolderProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-expand folder if a video inside it or its subfolders is selected
    useEffect(() => {
        if (selectedVideo && selectedVideo.path.startsWith(folder.path)) {
            setIsExpanded(true);
        }
    }, [selectedVideo, folder.path]);

    const hasContent = folder.videos.length > 0 || folder.subfolders.length > 0;

    return (
        <div className={`${depth > 0 ? 'ml-4 border-l border-white/5' : 'border-b border-white/5 last:border-0'}`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                disabled={!hasContent}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors group text-left"
            >
                <span className={`text-sm font-medium transition-colors ${isExpanded ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                    {folder.name}
                </span>
                {hasContent && (
                    <svg
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-white' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="space-y-1 bg-black/20">
                    {/* Render Subfolders */}
                    {folder.subfolders.map((subfolder) => (
                        <li key={subfolder.path}>
                            <RecursiveFolder
                                folder={subfolder}
                                selectedVideo={selectedVideo}
                                onSelectVideo={onSelectVideo}
                                depth={depth + 1}
                            />
                        </li>
                    ))}

                    {/* Render Videos */}
                    {folder.videos.map((video) => (
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
                </ul>
            </div>
        </div>
    );
}

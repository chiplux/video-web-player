'use client';

import { useState, useEffect } from 'react';
import { Folder, VideoFile, ResourceFile } from '@/lib/video';

interface TutorialListProps {
    tutorials: Folder[];
    selectedVideo: VideoFile | null;
    selectedResource: ResourceFile | null;
    onSelectVideo: (video: VideoFile) => void;
    onSelectResource: (resource: ResourceFile) => void;
}

export default function TutorialList({
    tutorials,
    selectedVideo,
    selectedResource,
    onSelectVideo,
    onSelectResource
}: TutorialListProps) {
    return (
        <div className="w-full h-full overflow-y-auto space-y-1 pt-4 pb-20">
            {tutorials.map((folder) => (
                <RecursiveFolder
                    key={folder.path}
                    folder={folder}
                    selectedVideo={selectedVideo}
                    selectedResource={selectedResource}
                    onSelectVideo={onSelectVideo}
                    onSelectResource={onSelectResource}
                    depth={0}
                />
            ))}
        </div>
    );
}

interface RecursiveFolderProps {
    folder: Folder;
    selectedVideo: VideoFile | null;
    selectedResource: ResourceFile | null;
    onSelectVideo: (video: VideoFile) => void;
    onSelectResource: (resource: ResourceFile) => void;
    depth: number;
}

function ResourceIcon({ type }: { type: ResourceFile['type'] }) {
    switch (type) {
        case 'pdf':
            return (
                <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        case 'code':
            return (
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            );
        case 'text':
            return (
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        default:
            return (
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
            );
    }
}

function RecursiveFolder({
    folder,
    selectedVideo,
    selectedResource,
    onSelectVideo,
    onSelectResource,
    depth
}: RecursiveFolderProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-expand folder if a video or resource inside it or its subfolders is selected
    useEffect(() => {
        const isSelected = (selectedVideo && selectedVideo.path.startsWith(folder.path)) ||
            (selectedResource && selectedResource.path.startsWith(folder.path));
        if (isSelected) {
            setIsExpanded(true);
        }
    }, [selectedVideo, selectedResource, folder.path]);

    const hasContent = folder.videos.length > 0 || folder.resources.length > 0 || folder.subfolders.length > 0;

    return (
        <div className={`${depth > 0 ? 'ml-4 border-l border-white/5' : 'border-b border-white/5 last:border-0'}`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                disabled={!hasContent}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors group text-left"
            >
                <div className="flex items-center gap-2">
                    <svg className={`w-3.5 h-3.5 transition-colors ${isExpanded ? 'text-white' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className={`text-sm font-medium transition-colors ${isExpanded ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {folder.name}
                    </span>
                </div>
                {hasContent && (
                    <svg
                        className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-white' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="space-y-0.5 bg-black/20 pb-2">
                    {/* Render Subfolders */}
                    {folder.subfolders.map((subfolder) => (
                        <li key={subfolder.path}>
                            <RecursiveFolder
                                folder={subfolder}
                                selectedVideo={selectedVideo}
                                selectedResource={selectedResource}
                                onSelectVideo={onSelectVideo}
                                onSelectResource={onSelectResource}
                                depth={depth + 1}
                            />
                        </li>
                    ))}

                    {/* Render Videos */}
                    {folder.videos.length > 0 && folder.videos.map((video) => (
                        <li key={video.path} className="px-2">
                            <button
                                onClick={() => onSelectVideo(video)}
                                className={`w-full text-left px-5 py-2 rounded-md transition-all text-xs flex items-center gap-2 ${selectedVideo?.path === video.path
                                    ? 'bg-white/10 text-white font-medium'
                                    : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <svg className={`w-3 h-3 flex-shrink-0 ${selectedVideo?.path === video.path ? 'text-white' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                <span className="truncate block">
                                    {video.name.replace(/\.[^/.]+$/, "")}
                                </span>
                            </button>
                        </li>
                    ))}

                    {/* Render Resources */}
                    {folder.resources.length > 0 && (
                        <>
                            <div className="px-6 py-1.5 flex items-center gap-2 opacity-50 mt-1">
                                <div className="h-px flex-1 bg-white/10" />
                                <span className="text-[9.5px] uppercase tracking-[0.1em] font-bold text-gray-500">Resources</span>
                                <div className="h-px flex-1 bg-white/10" />
                            </div>
                            {folder.resources.map((resource) => (
                                <li key={resource.path} className="px-2">
                                    <button
                                        onClick={() => onSelectResource(resource)}
                                        className={`w-full text-left px-5 py-2 rounded-md transition-all text-xs flex items-center gap-2 ${selectedResource?.path === resource.path
                                            ? 'bg-white/10 text-white font-medium'
                                            : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <ResourceIcon type={resource.type} />
                                        <span className="truncate block">
                                            {resource.name}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Folder, VideoFile, ResourceFile } from '@/lib/video';
import TutorialList from '@/components/TutorialList';
import VideoPlayer from '@/components/VideoPlayer';

interface HomeClientProps {
    tutorials: Folder[];
}

export default function HomeClient({ tutorials }: HomeClientProps) {
    // Recursively find first video
    const findFirstVideo = (folders: Folder[]): VideoFile | null => {
        for (const f of folders) {
            if (f.videos.length > 0) return f.videos[0];
            const sub = findFirstVideo(f.subfolders);
            if (sub) return sub;
        }
        return null;
    };

    const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(findFirstVideo(tutorials));
    const [selectedResource, setSelectedResource] = useState<ResourceFile | null>(null);
    const [resourceContent, setResourceContent] = useState<string | null>(null);
    const [isLoadingResource, setIsLoadingResource] = useState(false);

    // Get flat list of all videos in order for auto-play
    const getAllVideos = (folders: Folder[]): VideoFile[] => {
        let videos: VideoFile[] = [];
        for (const f of folders) {
            videos = [...videos, ...f.videos];
            videos = [...videos, ...getAllVideos(f.subfolders)];
        }
        return videos;
    };

    const handleVideoEnded = () => {
        const allVideos = getAllVideos(tutorials);
        const currentIndex = allVideos.findIndex(v => v.path === selectedVideo?.path);
        if (currentIndex !== -1 && currentIndex < allVideos.length - 1) {
            setSelectedVideo(allVideos[currentIndex + 1]);
            setSelectedResource(null);
        }
    };

    const handleSelectResource = async (resource: ResourceFile) => {
        setSelectedVideo(null);
        setSelectedResource(resource);

        if (resource.type === 'pdf') {
            window.open(`/api/video?path=${encodeURIComponent(resource.path)}`, '_blank');
            return;
        }

        if (resource.type === 'text' || resource.type === 'code') {
            setIsLoadingResource(true);
            try {
                const res = await fetch(`/api/video?path=${encodeURIComponent(resource.path)}`);
                const text = await res.text();
                setResourceContent(text);
            } catch (error) {
                console.error('Failed to load resource:', error);
                setResourceContent('Failed to load resource content.');
            } finally {
                setIsLoadingResource(false);
            }
        } else {
            // Other types just open in new tab
            window.open(`/api/video?path=${encodeURIComponent(resource.path)}`, '_blank');
        }
    };

    const handleSelectVideo = (video: VideoFile) => {
        setSelectedVideo(video);
        setSelectedResource(null);
        setResourceContent(null);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-black text-white">
            <aside className="w-80 bg-[#0a0a0a] border-r border-white/10 flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Tutorial Hub
                    </h1>
                </div>
                <TutorialList
                    tutorials={tutorials}
                    selectedVideo={selectedVideo}
                    selectedResource={selectedResource}
                    onSelectVideo={handleSelectVideo}
                    onSelectResource={handleSelectResource}
                />
            </aside>

            <main className="flex-1 bg-black overflow-y-auto overflow-x-hidden p-6 lg:p-10 scrollbar-hide">
                <div className="max-w-6xl mx-auto space-y-10">
                    {selectedVideo ? (
                        <article className="space-y-6 animate-in fade-in duration-700">
                            <div className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                                <VideoPlayer
                                    src={`/api/video?path=${encodeURIComponent(selectedVideo.path)}`}
                                    title={selectedVideo.name}
                                    subtitleSrc={selectedVideo.subtitles ? `/api/video?path=${encodeURIComponent(selectedVideo.subtitles)}` : undefined}
                                    onEnded={handleVideoEnded}
                                />
                            </div>

                            <header className="pt-2 px-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] uppercase font-bold tracking-wider text-gray-400 border border-white/5">
                                        Lesson
                                    </span>
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                                    {selectedVideo.name.replace(/\.[^/.]+$/, "")}
                                </h2>
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    <p className="truncate">{selectedVideo.path}</p>
                                </div>
                            </header>
                        </article>
                    ) : selectedResource ? (
                        <article className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <header className="pt-2 px-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] uppercase font-bold tracking-wider text-gray-400 border border-white/5">
                                        Resource
                                    </span>
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                                    {selectedResource.name}
                                </h2>
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    <p className="truncate">{selectedResource.path}</p>
                                </div>
                            </header>

                            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl min-h-[60vh] flex flex-col">
                                {isLoadingResource ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            <span className="text-gray-500 text-sm font-medium">Loading content...</span>
                                        </div>
                                    </div>
                                ) : resourceContent !== null ? (
                                    <div className="flex-1 p-6 lg:p-10 font-mono text-sm overflow-auto text-gray-300 selection:bg-white/20">
                                        <pre className="whitespace-pre-wrap leading-relaxed">{resourceContent}</pre>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Opening in new tab</h3>
                                        <p className="text-gray-500 max-w-sm">
                                            This file type cannot be previewed directly. We are opening it in a new browser tab for you.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </article>
                    ) : (
                        <div className="h-[70vh] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/5 rounded-3xl animate-in zoom-in-95 duration-1000">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-white/10 to-transparent flex items-center justify-center mb-8 border border-white/5">
                                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-600 mb-3">
                                Welcome to Tutorial Hub
                            </h2>
                            <p className="text-gray-500 max-w-sm leading-relaxed">
                                Choose a lesson or resource from the sidebar to continue your learning journey.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

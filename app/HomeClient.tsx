'use client';

import { useState } from 'react';
import { Folder, VideoFile } from '@/lib/video';
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
        }
    };

    return (
        <>
            <aside className="w-80 bg-[#0a0a0a] border-r border-white/10 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Video Tutorial
                    </h1>
                </div>
                <TutorialList
                    tutorials={tutorials}
                    selectedVideo={selectedVideo}
                    onSelectVideo={setSelectedVideo}
                />
            </aside>

            <section className="flex-1 bg-black overflow-y-auto p-8 lg:p-12">
                <div className="max-w-5xl mx-auto space-y-8">
                    {selectedVideo ? (
                        <>
                            <div className="space-y-4">
                                <VideoPlayer
                                    src={`/api/video?path=${encodeURIComponent(selectedVideo.path)}`}
                                    title={selectedVideo.name}
                                    subtitleSrc={selectedVideo.subtitles ? `/api/video?path=${encodeURIComponent(selectedVideo.subtitles)}` : undefined}
                                    onEnded={handleVideoEnded}
                                />
                                <div className="pt-4 border-t border-white/5">
                                    <h2 className="text-2xl font-semibold text-white">
                                        {selectedVideo.name.replace(/\.[^/.]+$/, "")}
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">
                                        File: <span className="text-gray-300 font-medium">{selectedVideo.path}</span>
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 border-2 border-dashed border-white/5 rounded-2xl aspect-video">
                            Select a video to start your tutorial
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

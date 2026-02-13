'use client';

import { useState } from 'react';
import { Tutorial, VideoFile } from '@/lib/video';
import TutorialList from '@/components/TutorialList';
import VideoPlayer from '@/components/VideoPlayer';

interface HomeClientProps {
    tutorials: Tutorial[];
}

export default function HomeClient({ tutorials }: HomeClientProps) {
    const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(
        tutorials.length > 0 && tutorials[0].videos.length > 0 ? tutorials[0].videos[0] : null
    );

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
                                />
                                <div className="pt-4 border-t border-white/5">
                                    <h2 className="text-2xl font-semibold text-white">
                                        {selectedVideo.name.replace(/\.[^/.]+$/, "")}
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Path: <span className="text-gray-300 font-medium">{selectedVideo.folder || 'Root'}</span>
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

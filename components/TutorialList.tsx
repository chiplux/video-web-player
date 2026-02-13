'use client';

import { Tutorial, VideoFile } from '@/lib/video';

interface TutorialListProps {
    tutorials: Tutorial[];
    selectedVideo: VideoFile | null;
    onSelectVideo: (video: VideoFile) => void;
}

export default function TutorialList({ tutorials, selectedVideo, onSelectVideo }: TutorialListProps) {
    return (
        <div className="w-full h-full overflow-y-auto space-y-6 pt-4">
            {tutorials.map((tutorial) => (
                <div key={tutorial.name} className="px-4">
                    <h3 className="text-gray-400 uppercase text-xs font-semibold mb-3 tracking-wider">
                        {tutorial.name}
                    </h3>
                    <ul className="space-y-1">
                        {tutorial.videos.map((video) => (
                            <li key={video.path}>
                                <button
                                    onClick={() => onSelectVideo(video)}
                                    className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${selectedVideo?.path === video.path
                                            ? 'bg-white/10 text-white font-medium border-l-2 border-white'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span className="truncate block">{video.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

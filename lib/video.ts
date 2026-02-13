import fs from 'fs';
import path from 'path';

const VIDEO_DIR = path.join(process.cwd(), 'video');

export interface VideoFile {
    name: string;
    path: string;
    subtitles?: string;
}

export interface Folder {
    name: string;
    path: string;
    videos: VideoFile[];
    subfolders: Folder[];
}

function scanDirectory(dirPath: string): Folder {
    const name = path.basename(dirPath);
    const relPath = path.relative(VIDEO_DIR, dirPath);

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    const videos: VideoFile[] = [];
    const subfolders: Folder[] = [];

    // First pass: collect all files in this directory to find subtitles easily
    const allFileNames = entries.filter(e => e.isFile()).map(e => e.name);

    entries.forEach(entry => {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            subfolders.push(scanDirectory(fullPath));
        } else if (/\.(mp4|mkv|webm)$/i.test(entry.name)) {
            const baseName = path.parse(entry.name).name;
            const subtitle = allFileNames.find(f => f.startsWith(baseName) && /\.(srt|vtt)$/i.test(f));

            videos.push({
                name: entry.name,
                path: path.relative(VIDEO_DIR, fullPath),
                subtitles: subtitle ? path.relative(VIDEO_DIR, path.join(dirPath, subtitle)) : undefined,
            });
        }
    });

    return {
        name: relPath === '' ? 'Tutorials' : name,
        path: relPath,
        videos: videos.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
        subfolders: subfolders.sort((a, b) => a.name.localeCompare(b.name)),
    };
}

export function getTutorials(): Folder[] {
    console.log(`Scanning VIDEO_DIR: ${VIDEO_DIR}`);
    if (!fs.existsSync(VIDEO_DIR)) {
        console.warn(`VIDEO_DIR does not exist: ${VIDEO_DIR}`);
        return [];
    }

    // We return the subfolders of the VIDEO_DIR as the top-level "Tutorials"
    const rootFolder = scanDirectory(VIDEO_DIR);
    return rootFolder.subfolders;
}

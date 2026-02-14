import fs from 'fs';
import path from 'path';

const VIDEO_DIR = path.join(process.cwd(), 'video');

export interface VideoFile {
    name: string;
    path: string;
    subtitles?: string;
}

export interface ResourceFile {
    name: string;
    path: string;
    type: 'pdf' | 'text' | 'code' | 'other';
}

export interface Folder {
    name: string;
    path: string;
    videos: VideoFile[];
    resources: ResourceFile[];
    subfolders: Folder[];
}

function getResourceType(ext: string): 'pdf' | 'text' | 'code' | 'other' {
    const e = ext.toLowerCase();
    if (e === '.pdf') return 'pdf';
    if (['.txt', '.md'].includes(e)) return 'text';
    if (['.py', '.sh', '.js', '.ts', '.json', '.yaml', '.yml', '.sql', '.css', '.html'].includes(e)) return 'code';
    return 'other';
}

function scanDirectory(dirPath: string): Folder {
    const name = path.basename(dirPath);
    const relPath = path.relative(VIDEO_DIR, dirPath);

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    const videos: VideoFile[] = [];
    const resources: ResourceFile[] = [];
    const subfolders: Folder[] = [];

    // First pass: collect all files in this directory to find subtitles easily
    const allFileNames = entries.filter(e => e.isFile()).map(e => e.name);

    entries.forEach(entry => {
        const fullPath = path.join(dirPath, entry.name);
        const ext = path.extname(entry.name);

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
        } else if (!/\.(srt|vtt)$/i.test(entry.name)) {
            // It's a resource (and not a subtitle file we already handle)
            resources.push({
                name: entry.name,
                path: path.relative(VIDEO_DIR, fullPath),
                type: getResourceType(ext),
            });
        }
    });

    return {
        name: relPath === '' ? 'Tutorials' : name,
        path: relPath,
        videos: videos.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
        resources: resources.sort((a, b) => a.name.localeCompare(b.name)),
        subfolders: subfolders.sort((a, b) => a.name.localeCompare(b.name)),
    };
}

export function getTutorials(): Folder[] {
    console.log(`Scanning VIDEO_DIR: ${VIDEO_DIR}`);
    if (!fs.existsSync(VIDEO_DIR)) {
        console.warn(`VIDEO_DIR does not exist: ${VIDEO_DIR}`);
        return [];
    }

    const rootFolder = scanDirectory(VIDEO_DIR);
    return rootFolder.subfolders;
}

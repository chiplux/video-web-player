import fs from 'fs';
import path from 'path';

const VIDEO_DIR = path.join(process.cwd(), 'video');

export interface VideoFile {
    name: string;
    path: string;
    subtitles?: string;
    folder?: string;
}

export interface Tutorial {
    name: string;
    videos: VideoFile[];
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

export function getTutorials(): Tutorial[] {
    console.log(`Scanning VIDEO_DIR: ${VIDEO_DIR}`);
    if (!fs.existsSync(VIDEO_DIR)) {
        console.warn(`VIDEO_DIR does not exist: ${VIDEO_DIR}`);
        return [];
    }

    const entries = fs.readdirSync(VIDEO_DIR, { withFileTypes: true });
    console.log(`Found ${entries.length} entries in VIDEO_DIR`);

    const topFolders = entries
        .filter(dirent => {
            const isDir = dirent.isDirectory();
            // Fallback for some filesystem types that don't report correctly
            if (!isDir) {
                try {
                    return fs.statSync(path.join(VIDEO_DIR, dirent.name)).isDirectory();
                } catch {
                    return false;
                }
            }
            return isDir;
        })
        .map(dirent => dirent.name);

    console.log(`Top level folders: ${topFolders.join(', ')}`);

    return topFolders.map(folder => {
        const folderPath = path.join(VIDEO_DIR, folder);
        console.log(`Scanning folder: ${folderPath}`);
        const allFiles = getAllFiles(folderPath);
        console.log(`Found ${allFiles.length} files in ${folder}`);

        const videoFiles: VideoFile[] = allFiles
            .filter(file => /\.(mp4|mkv|webm)$/i.test(file))
            .map(file => {
                const relPath = path.relative(VIDEO_DIR, file);
                const folderName = path.dirname(relPath);
                const baseName = path.parse(file).name;

                // Find subtitle in the same directory
                const dir = path.dirname(file);
                const dirFiles = fs.readdirSync(dir);
                const subtitle = dirFiles.find(f => f.startsWith(baseName) && /\.(srt|vtt)$/i.test(f));

                return {
                    name: path.basename(file),
                    path: relPath, // Store relative path without encoding
                    subtitles: subtitle ? path.join(folderName, subtitle) : undefined,
                    folder: folderName,
                };
            });

        return {
            name: folder,
            videos: videoFiles,
        };
    });
}

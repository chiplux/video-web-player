import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VIDEO_DIR = path.join(process.cwd(), 'video');

function srtToVtt(srt: string): string {
    const vtt = srt
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');

    return 'WEBVTT\n\n' + vtt;
}

function getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.pdf': return 'application/pdf';
        case '.vtt': return 'text/vtt';
        case '.txt':
        case '.md':
        case '.py':
        case '.sh':
        case '.js':
        case '.ts':
        case '.json':
        case '.yaml':
        case '.yml':
        case '.sql':
        case '.css':
        case '.html':
            return 'text/plain'; // Serve as plain text for viewing
        default: return 'application/octet-stream';
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
        return new NextResponse('File path is required', { status: 400 });
    }

    const absolutePath = path.join(VIDEO_DIR, decodeURIComponent(filePath));

    if (!absolutePath.startsWith(VIDEO_DIR)) {
        return new NextResponse('Access denied', { status: 403 });
    }

    if (!fs.existsSync(absolutePath)) {
        return new NextResponse('File not found', { status: 404 });
    }

    const stat = fs.statSync(absolutePath);
    if (stat.isDirectory()) {
        return new NextResponse('Cannot read directory', { status: 400 });
    }
    const fileSize = stat.size;

    if (absolutePath.endsWith('.srt')) {
        const srtContent = fs.readFileSync(absolutePath, 'utf8');
        const vttContent = srtToVtt(srtContent);
        return new NextResponse(vttContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/vtt',
                'Content-Length': Buffer.byteLength(vttContent).toString(),
            },
        });
    }

    const range = request.headers.get('range');
    const isVideo = /\.(mp4|mkv|webm)$/i.test(absolutePath);
    const contentType = isVideo ? 'video/mp4' : getContentType(absolutePath);

    if (range && isVideo) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(absolutePath, { start, end });

        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': contentType,
        };

        // @ts-expect-error: Next.js NextResponse expects a body of certain types
        return new NextResponse(file, { status: 206, headers: head });
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': contentType,
            // For PDFs we might want inline, for others too
            'Content-Disposition': 'inline',
        };
        const file = fs.createReadStream(absolutePath);
        // @ts-expect-error: Next.js NextResponse expects a body of certain types
        return new NextResponse(file, { status: 200, headers: head });
    }
}

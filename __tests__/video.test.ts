import { getTutorials } from '../lib/video';
import fs from 'fs';

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('video utility', () => {
    it('should return empty list if video directory does not exist', () => {
        mockedFs.existsSync.mockReturnValue(false);
        expect(getTutorials()).toEqual([]);
    });

    it('should list tutorials and videos', () => {
        mockedFs.existsSync.mockReturnValue(true);

        // Mock readdirSync for top level folders
        mockedFs.readdirSync.mockReturnValueOnce([
            { name: 'Tutorial 1', isDirectory: () => true },
        ] as any);

        // Mock readdirSync for folderPath (inside getAllFiles)
        mockedFs.readdirSync.mockReturnValueOnce(['video1.mp4'] as any);

        // Mock statSync for file vs dir check
        mockedFs.statSync.mockReturnValue({ isDirectory: () => false } as any);

        // Second call to readdirSync for dir (inside subtitle map)
        mockedFs.readdirSync.mockReturnValueOnce(['video1.mp4', 'video1.srt'] as any);

        const tutorials = getTutorials();
        expect(tutorials.length).toBe(1);
        expect(tutorials[0].name).toBe('Tutorial 1');
        expect(tutorials[0].videos[0].name).toBe('video1.mp4');
        expect(tutorials[0].videos[0].subtitles).toBeDefined();
    });
});

import { render, screen } from '@testing-library/react';
import VideoPlayer from '../components/VideoPlayer';

describe('VideoPlayer', () => {
    it('renders a video element with source', () => {
        const { container } = render(<VideoPlayer src="/test.mp4" title="Test Video" />);
        const videoElement = container.querySelector('video');
        expect(videoElement).toBeInTheDocument();
        expect(videoElement).toHaveAttribute('src', '/test.mp4');
    });

    it('shows title on container', () => {
        render(<VideoPlayer src="/test.mp4" title="Test Video" />);
        expect(screen.getByText('Test Video')).toBeInTheDocument();
    });
});

# Video Player Tutorial

A modern, high-performance web video player tutorial built with Next.js. This application scans a local directory for video tutorials, organizes them into an accordion-style sidebar, and supports playback with subtitles and advanced streaming features.

## 🚀 Features

- **Recursive Directory Scanning**: Automatically discovers video files (`.mp4`, `.mkv`, `.webm`) and subtitles (`.srt`, `.vtt`) in the `video` directory.
- **Accordion Menu Navigation**: Clean and organized sidebar to navigate through tutorial folders.
- **Advanced Video Streaming**: Supports **Byte Range Requests** for smooth seeking and performance.
- **On-the-fly Subtitle Conversion**: Automatically converts `.srt` files to browser-compatible `.vtt` format.
- **Premium Dark Theme**: Sleek, focused UI designed for a better viewing experience.
- **Hover Title Overlay**: Reveals the current video title when hovering over the player.
- **Dockerized**: Ready for production with multi-stage Docker builds and Docker Compose.
- **Developer Friendly**: Includes a `Makefile` for common tasks and a comprehensive unit testing suite.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Testing**: Jest & React Testing Library
- **Infrastructure**: Docker & Docker Compose
- **Language**: TypeScript

## 🏁 Getting Started

### Prerequisites

- Node.js (v20+)
- Docker (optional, for containerization)
- A `video` directory at the root containing your tutorial folders.

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:4500](http://localhost:4500).

3. **Run tests**:
   ```bash
   npm test
   ```

### Running with Docker

The easiest way to run the application is using Docker Compose:

```bash
make docker-up
```

This will build the image and start the container with the `video` directory mounted as a volume.

## 📂 Makefile Commands

| Command            | Description                          |
| :----------------- | :----------------------------------- |
| `make dev`         | Start the local development server   |
| `make build`       | Build the Next.js application        |
| `make test`        | Run the unit test suite              |
| `make docker-up`   | Build and start the Docker container |
| `make docker-down` | Stop the Docker container            |

## 🧪 Testing

The project uses Jest for unit testing. Tests are located in the `__tests__` directory and cover both server-side utilities and client-side components.

```bash
make test
```

## 📄 License

MIT

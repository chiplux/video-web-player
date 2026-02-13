import { getTutorials } from '@/lib/video';
import HomeClient from './HomeClient';

export default function Home() {
  const tutorials = getTutorials();

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex h-screen overflow-hidden">
        <HomeClient tutorials={tutorials} />
      </div>
    </main>
  );
}

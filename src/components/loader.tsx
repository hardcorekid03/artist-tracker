import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        {/* Spotify-like logo placeholder with pulsating effect */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#1DB954] animate-pulse-slow">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        </div>
        <p className="text-lg font-semibold text-white">Loading Spotify...</p>
      </div>
    </div>
  );
}

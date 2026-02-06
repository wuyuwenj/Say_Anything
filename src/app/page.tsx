import Link from "next/link";
import { Button } from "@/components/ui/button";

const characters = [
  { name: "Mina", color: "from-pink-500 to-rose-600" },
  { name: "Kai", color: "from-blue-500 to-cyan-600" },
  { name: "Luna", color: "from-orange-400 to-amber-500" },
  { name: "Alex", color: "from-emerald-500 to-teal-600" },
  { name: "River", color: "from-violet-500 to-purple-600" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-3xl">
        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
          Say Anything
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-slate-300">
          A dating sim where you can say anything — powered by real-time AI
        </p>

        {/* Character avatars */}
        <div className="flex justify-center items-center gap-3 mt-8">
          {characters.map((char, i) => (
            <div
              key={char.name}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${char.color} flex items-center justify-center shadow-lg transition-transform hover:scale-110 hover:-translate-y-1`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-xl md:text-2xl font-bold text-white">{char.name[0]}</span>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <p className="text-slate-400 text-lg">
          Choose your date. Set the scene. See where the night takes you.
        </p>

        {/* Start button */}
        <Link href="/setup">
          <Button
            size="lg"
            className="mt-6 text-lg px-12 py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
          >
            Begin
          </Button>
        </Link>

        {/* Features */}
        <div className="flex justify-center gap-6 text-sm text-slate-500 mt-8">
          <span>5 characters</span>
          <span className="text-slate-600">•</span>
          <span>4 moods</span>
          <span className="text-slate-600">•</span>
          <span>Real-time AI video</span>
        </div>
      </div>
    </main>
  );
}

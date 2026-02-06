"use client";

import Link from "next/link";

export default function Home() {
  return (
    <>
      <style jsx global>{`
        .home-page {
          font-family: var(--font-nunito), 'Nunito', sans-serif;
          background-color: #FFC0CB;
          background-image: radial-gradient(#ffffff 20%, transparent 20%),
                            radial-gradient(#ffffff 20%, transparent 20%);
          background-size: 40px 40px;
          background-position: 0 0, 20px 20px;
        }
        .bubbly-font {
          font-family: var(--font-fredoka), 'Fredoka', sans-serif;
        }
        .pop-shadow {
          box-shadow: 0 8px 0 rgba(0,0,0,0.1);
        }
        .pop-shadow:active {
          box-shadow: 0 0 0 rgba(0,0,0,0.1);
          transform: translateY(8px);
        }
        .text-outline {
          text-shadow: 2px 2px 0px #ffffff, -1px -1px 0 #ffffff, 1px -1px 0 #ffffff, -1px 1px 0 #ffffff, 1px 1px 0 #ffffff;
        }
      `}</style>

      <div className="home-page min-h-screen flex items-center justify-center p-4 selection:bg-[#98FF98] selection:text-gray-700 overflow-x-hidden">
        {/* Floating Background Decor */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <iconify-icon icon="solar:heart-linear" className="absolute top-10 left-10 text-white/40 text-6xl animate-bounce" style={{ animationDuration: "3s" }}></iconify-icon>
          <iconify-icon icon="solar:stars-minimalistic-linear" className="absolute bottom-20 right-20 text-white/50 text-8xl animate-pulse"></iconify-icon>
          <iconify-icon icon="solar:heart-angle-linear" className="absolute top-1/3 right-10 text-white/40 text-5xl" style={{ transform: "rotate(15deg)" }}></iconify-icon>
          <iconify-icon icon="solar:confetti-minimalistic-linear" className="absolute bottom-10 left-20 text-white/40 text-7xl"></iconify-icon>
        </div>

        {/* Main Game Window / Dialog Box */}
        <main className="relative z-10 w-full max-w-4xl bg-white/80 backdrop-blur-md rounded-[3rem] border-[6px] border-white shadow-2xl flex flex-col items-center justify-center text-center px-6 py-12 md:py-16 md:px-12 overflow-hidden">

          {/* Striped decorative top bar inside container */}
          <div
            className="absolute top-0 left-0 w-full h-4 bg-[length:20px_20px] opacity-30"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #87CEEB 0, #87CEEB 2px, transparent 2px, transparent 10px)" }}
          />

          {/* Header */}
          <header className="mb-10 space-y-4 relative">
            <div className="inline-block relative">
              {/* Decorative Icon behind title */}
              <iconify-icon icon="solar:chat-round-dots-linear" className="absolute -top-8 -right-8 text-[#98FF98]/60 text-7xl transform rotate-12"></iconify-icon>
              <h1 className="bubbly-font text-5xl md:text-7xl font-semibold text-[#FF6B6B] tracking-tight text-outline relative z-10">
                Say Anything
              </h1>
            </div>
            <p className="text-gray-600 text-lg md:text-xl font-semibold max-w-lg mx-auto leading-relaxed">
              A dating sim where you can say anything — powered by real-time AI
            </p>
          </header>

          {/* Characters */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-12 w-full">

            {/* Mina (Pink/Rose) */}
            <div className="group flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-rose-200 border-[5px] border-white shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105 overflow-hidden relative">
                <iconify-icon icon="solar:user-heart-linear" className="text-rose-500 text-4xl"></iconify-icon>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="bubbly-font text-gray-500 text-sm md:text-base font-medium group-hover:text-rose-500 transition-colors">Mina</span>
            </div>

            {/* Kai (Blue/Cyan) */}
            <div className="group flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-cyan-200 border-[5px] border-white shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105 overflow-hidden">
                <iconify-icon icon="solar:gamepad-linear" className="text-cyan-600 text-4xl"></iconify-icon>
              </div>
              <span className="bubbly-font text-gray-500 text-sm md:text-base font-medium group-hover:text-cyan-600 transition-colors">Kai</span>
            </div>

            {/* Luna (Orange/Amber) */}
            <div className="group flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-amber-200 border-[5px] border-white shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105 overflow-hidden">
                <iconify-icon icon="solar:sun-2-linear" className="text-amber-600 text-4xl"></iconify-icon>
              </div>
              <span className="bubbly-font text-gray-500 text-sm md:text-base font-medium group-hover:text-amber-600 transition-colors">Luna</span>
            </div>

            {/* Alex (Emerald/Teal) */}
            <div className="group flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-emerald-200 border-[5px] border-white shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105 overflow-hidden">
                <iconify-icon icon="solar:book-bookmark-linear" className="text-emerald-600 text-4xl"></iconify-icon>
              </div>
              <span className="bubbly-font text-gray-500 text-sm md:text-base font-medium group-hover:text-emerald-600 transition-colors">Alex</span>
            </div>

            {/* River (Violet/Purple) */}
            <div className="group flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-violet-200 border-[5px] border-white shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105 overflow-hidden">
                <iconify-icon icon="solar:music-note-linear" className="text-violet-600 text-4xl"></iconify-icon>
              </div>
              <span className="bubbly-font text-gray-500 text-sm md:text-base font-medium group-hover:text-violet-600 transition-colors">River</span>
            </div>

          </div>

          {/* Tagline */}
          <div className="mb-10 relative">
            <div className="bg-white/60 px-6 py-2 rounded-2xl inline-block">
              <p className="text-gray-700 text-lg md:text-xl font-semibold italic">
                &quot;Choose your date. Set the scene. See where the night takes you.&quot;
              </p>
            </div>
          </div>

          {/* Action Button */}
          <Link href="/setup" className="group relative inline-block mb-10 transition-transform hover:scale-105 active:scale-95">
            <button className="bubbly-font bg-[#87CEEB] text-white text-2xl md:text-3xl font-medium py-4 px-16 rounded-full border-[6px] border-white pop-shadow transition-all group-hover:bg-[#7BC6E6] flex items-center gap-3">
              <span>Begin</span>
              <iconify-icon icon="solar:arrow-right-linear" className="text-2xl"></iconify-icon>
            </button>
          </Link>

          {/* Features Footer */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-8 text-gray-500 font-semibold text-sm tracking-wide bg-white/50 px-8 py-3 rounded-full border border-white/60">
            <div className="flex items-center gap-2">
              <iconify-icon icon="solar:users-group-rounded-linear" className="text-lg"></iconify-icon>
              <span>5 characters</span>
            </div>
            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <iconify-icon icon="solar:emoji-funny-circle-linear" className="text-lg"></iconify-icon>
              <span>4 moods</span>
            </div>
            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <iconify-icon icon="solar:videocamera-record-linear" className="text-lg text-[#FF6B6B] animate-pulse"></iconify-icon>
              <span>Real-time AI video</span>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}

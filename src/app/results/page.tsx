"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { episode1 } from "@/content/episode1";
import { Meters, Condition, Outcome } from "@/lib/types";

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsLoading />}>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsLoading() {
  return (
    <div className="results-page min-h-screen flex items-center justify-center">
      <div className="text-gray-500 bubbly-font text-xl">Loading results...</div>
    </div>
  );
}

function checkCondition(condition: Condition, meters: Meters): boolean {
  if (condition.chemistryAtLeast !== undefined && meters.chemistry < condition.chemistryAtLeast) return false;
  if (condition.chemistryAtMost !== undefined && meters.chemistry > condition.chemistryAtMost) return false;
  if (condition.trustAtLeast !== undefined && meters.trust < condition.trustAtLeast) return false;
  if (condition.trustAtMost !== undefined && meters.trust > condition.trustAtMost) return false;
  if (condition.affectionAtLeast !== undefined && meters.affection < condition.affectionAtLeast) return false;
  if (condition.affectionAtMost !== undefined && meters.affection > condition.affectionAtMost) return false;
  return true;
}

function determineOutcome(meters: Meters): Outcome | null {
  for (const outcome of episode1.outcomes) {
    if (checkCondition(outcome.condition, meters)) {
      return outcome;
    }
  }
  return null;
}

const OUTCOME_DISPLAY: Record<string, { emoji: string; color: string; bgColor: string }> = {
  spark: { emoji: "💕", color: "text-rose-500", bgColor: "bg-rose-100" },
  steady: { emoji: "✨", color: "text-purple-500", bgColor: "bg-purple-100" },
  awkward: { emoji: "😅", color: "text-amber-500", bgColor: "bg-amber-100" },
};

const DEFAULT_DISPLAY = { emoji: "🤔", color: "text-gray-500", bgColor: "bg-gray-100" };

function ResultsContent() {
  const searchParams = useSearchParams();

  const meters: Meters = {
    trust: parseInt(searchParams.get("trust") || "0"),
    chemistry: parseInt(searchParams.get("chemistry") || "0"),
    affection: parseInt(searchParams.get("affection") || "0"),
  };

  const outcome = determineOutcome(meters);
  const display = outcome ? OUTCOME_DISPLAY[outcome.outcomeId] || DEFAULT_DISPLAY : DEFAULT_DISPLAY;
  const meterConfig = episode1.meters;

  // Calculate percentages for meters (-3 to 6 range = 9 total)
  const calcPercentage = (value: number, min: number, max: number) => {
    return Math.round(((value - min) / (max - min)) * 100);
  };

  const trustPercent = calcPercentage(meters.trust, meterConfig.trust.min, meterConfig.trust.max);
  const chemistryPercent = calcPercentage(meters.chemistry, meterConfig.chemistry.min, meterConfig.chemistry.max);
  const affectionPercent = calcPercentage(meters.affection, meterConfig.affection.min, meterConfig.affection.max);

  return (
    <>
      <style jsx global>{`
        .results-page {
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
          box-shadow: 0 4px 0 rgba(0,0,0,0.1);
        }
        .pop-shadow:active {
          box-shadow: 0 0 0 rgba(0,0,0,0.1);
          transform: translateY(4px);
        }
        .text-outline {
          text-shadow: 2px 2px 0px #ffffff, -1px -1px 0 #ffffff, 1px -1px 0 #ffffff, -1px 1px 0 #ffffff, 1px 1px 0 #ffffff;
        }
        @keyframes fill {
          from { width: 0%; }
        }
        .animate-fill {
          animation: fill 1s ease-out forwards;
        }
      `}</style>

      <div className="results-page min-h-screen flex items-center justify-center p-4 selection:bg-[#98FF98] selection:text-gray-700">
        {/* Background Decor */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <iconify-icon icon="solar:stars-minimalistic-linear" className="absolute top-10 left-10 text-white/40 text-6xl animate-pulse"></iconify-icon>
          <iconify-icon icon="solar:heart-linear" className="absolute bottom-20 right-20 text-white/50 text-8xl animate-bounce" style={{ animationDuration: "3s" }}></iconify-icon>
          <iconify-icon icon="solar:confetti-minimalistic-linear" className="absolute top-1/4 right-10 text-white/40 text-7xl" style={{ transform: "rotate(-15deg)" }}></iconify-icon>
        </div>

        <main className="relative z-10 w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-[3rem] border-[6px] border-white shadow-2xl flex flex-col items-center text-center px-6 py-10 md:py-12 md:px-10 overflow-hidden">

          {/* Decorative top bar */}
          <div
            className="absolute top-0 left-0 w-full h-4 bg-[length:20px_20px] opacity-30"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #FF6B6B 0, #FF6B6B 2px, transparent 2px, transparent 10px)" }}
          />

          {/* Outcome Header */}
          <header className="mb-8 space-y-4">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${display.bgColor} border-4 border-white shadow-lg`}>
              <span className="text-5xl">{display.emoji}</span>
            </div>
            <h1 className={`bubbly-font text-4xl md:text-5xl font-bold ${display.color} text-outline`}>
              {outcome?.label || "Date Complete"}
            </h1>
            <p className="text-gray-600 text-lg md:text-xl font-semibold max-w-sm mx-auto leading-relaxed">
              {outcome?.uiSummary || "Thanks for playing!"}
            </p>
          </header>

          {/* Stats Card */}
          <section className="w-full mb-10 bg-white/50 rounded-3xl p-6 border-[3px] border-white shadow-inner">
            <h2 className="bubbly-font text-xl text-gray-400 mb-6 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
              <iconify-icon icon="solar:chart-square-linear" className="text-gray-400"></iconify-icon>
              Final Stats
            </h2>

            <div className="space-y-5">
              {/* Trust Meter */}
              <div className="group">
                <div className="flex justify-between items-end mb-2 px-1">
                  <label className="font-bold text-gray-600 flex items-center gap-2">
                    <iconify-icon icon="solar:shield-check-linear" className="text-indigo-400"></iconify-icon>
                    Trust
                  </label>
                  <span className="bubbly-font text-indigo-500 text-xl font-semibold">{meters.trust}</span>
                </div>
                <div className="w-full h-4 bg-white rounded-full p-1 shadow-sm border border-indigo-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-400 animate-fill relative overflow-hidden"
                    style={{ width: `${trustPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Chemistry Meter */}
              <div className="group">
                <div className="flex justify-between items-end mb-2 px-1">
                  <label className="font-bold text-gray-600 flex items-center gap-2">
                    <iconify-icon icon="solar:test-tube-minimalistic-linear" className="text-rose-400"></iconify-icon>
                    Chemistry
                  </label>
                  <span className="bubbly-font text-rose-500 text-xl font-semibold">{meters.chemistry}</span>
                </div>
                <div className="w-full h-4 bg-white rounded-full p-1 shadow-sm border border-rose-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#FF6B6B] animate-fill relative overflow-hidden"
                    style={{ width: `${chemistryPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Affection Meter */}
              <div className="group">
                <div className="flex justify-between items-end mb-2 px-1">
                  <label className="font-bold text-gray-600 flex items-center gap-2">
                    <iconify-icon icon="solar:heart-angle-linear" className="text-amber-400"></iconify-icon>
                    Affection
                  </label>
                  <span className="bubbly-font text-amber-500 text-xl font-semibold">{meters.affection}</span>
                </div>
                <div className="w-full h-4 bg-white rounded-full p-1 shadow-sm border border-amber-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 animate-fill relative overflow-hidden"
                    style={{ width: `${affectionPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <section className="flex flex-col gap-4 w-full">
            <Link href="/setup" className="group w-full">
              <button className="bubbly-font w-full bg-[#87CEEB] text-white text-lg font-semibold py-4 px-6 rounded-2xl border-[4px] border-white pop-shadow transition-colors group-hover:bg-[#7BC6E6] flex items-center justify-center gap-2">
                <iconify-icon icon="solar:restart-square-linear" width="24"></iconify-icon>
                <span>Try Again with Different Settings</span>
              </button>
            </Link>

            <Link href="/" className="group w-full">
              <button className="bubbly-font w-full bg-white text-gray-400 text-lg font-semibold py-3 px-6 rounded-2xl border-2 border-transparent hover:border-gray-100 hover:text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                <iconify-icon icon="solar:home-smile-linear" width="22"></iconify-icon>
                <span>Back to Home</span>
              </button>
            </Link>
          </section>

        </main>
      </div>
    </>
  );
}

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white">Loading results...</div>
    </main>
  );
}

// Check if a condition is met given current meters
function checkCondition(condition: Condition, meters: Meters): boolean {
  if (condition.chemistryAtLeast !== undefined && meters.chemistry < condition.chemistryAtLeast) {
    return false;
  }
  if (condition.chemistryAtMost !== undefined && meters.chemistry > condition.chemistryAtMost) {
    return false;
  }
  if (condition.trustAtLeast !== undefined && meters.trust < condition.trustAtLeast) {
    return false;
  }
  if (condition.trustAtMost !== undefined && meters.trust > condition.trustAtMost) {
    return false;
  }
  if (condition.affectionAtLeast !== undefined && meters.affection < condition.affectionAtLeast) {
    return false;
  }
  if (condition.affectionAtMost !== undefined && meters.affection > condition.affectionAtMost) {
    return false;
  }
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

// Map outcome IDs to display info
const OUTCOME_DISPLAY: Record<string, { emoji: string; color: string }> = {
  spark: { emoji: "💕", color: "from-pink-500 to-red-500" },
  steady: { emoji: "✨", color: "from-purple-500 to-pink-500" },
  awkward: { emoji: "😅", color: "from-slate-500 to-blue-500" },
};

const DEFAULT_DISPLAY = { emoji: "🤔", color: "from-blue-500 to-purple-500" };

function ResultsContent() {
  const searchParams = useSearchParams();

  // Parse meters from URL (now using -3 to 6 range)
  const meters: Meters = {
    trust: parseInt(searchParams.get("trust") || "0"),
    chemistry: parseInt(searchParams.get("chemistry") || "0"),
    affection: parseInt(searchParams.get("affection") || "0"),
  };

  const outcome = determineOutcome(meters);
  const display = outcome ? OUTCOME_DISPLAY[outcome.outcomeId] || DEFAULT_DISPLAY : DEFAULT_DISPLAY;

  // Meter config from episode
  const meterConfig = episode1.meters;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-8 text-center">
        {/* Outcome Header */}
        <div className="space-y-4">
          <span className="text-6xl">{display.emoji}</span>
          <h1 className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${display.color}`}>
            {outcome?.label || "Date Complete"}
          </h1>
          <p className="text-xl text-slate-300">
            {outcome?.uiSummary || "Thanks for playing!"}
          </p>
        </div>

        {/* Final Stats */}
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Final Stats</h2>
          <div className="space-y-4">
            <StatBar
              label="Trust"
              value={meters.trust}
              min={meterConfig.trust.min}
              max={meterConfig.trust.max}
              color="bg-blue-500"
            />
            <StatBar
              label="Chemistry"
              value={meters.chemistry}
              min={meterConfig.chemistry.min}
              max={meterConfig.chemistry.max}
              color="bg-pink-500"
            />
            <StatBar
              label="Affection"
              value={meters.affection}
              min={meterConfig.affection.min}
              max={meterConfig.affection.max}
              color="bg-red-500"
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link href="/setup">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              Try Again with Different Settings
            </Button>
          </Link>
          <Link href="/">
            <Button
              size="lg"
              variant="outline"
              className="w-full bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

interface StatBarProps {
  label: string;
  value: number;
  min: number;
  max: number;
  color: string;
}

function StatBar({ label, value, min, max, color }: StatBarProps) {
  // Calculate percentage for display (map -3..6 to 0..100)
  const range = max - min;
  const percentage = ((value - min) / range) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-mono">{value}</span>
      </div>
      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

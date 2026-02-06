"use client";

import { useState, useCallback, useMemo } from "react";
import {
  GameState,
  Meters,
  MeterDelta,
  LocationId,
  ToneId,
  Turn,
  TranscriptEntry,
  Condition,
  NpcLineVariant,
  Outcome,
} from "./types";
import { episode1 } from "@/content/episode1";

// Meter config from schema
const METER_CONFIG = episode1.meters;
const INITIAL_METERS: Meters = {
  trust: METER_CONFIG.trust.start,
  chemistry: METER_CONFIG.chemistry.start,
  affection: METER_CONFIG.affection.start,
};

interface UseGameEngineProps {
  locationId: LocationId;
  toneId: ToneId;
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

// Select the appropriate NPC line variant based on conditions
function selectNpcLineVariant(
  variants: NpcLineVariant[],
  meters: Meters
): NpcLineVariant | null {
  // Check variants in order - first matching condition wins
  // Empty condition {} always matches (used as fallback)
  for (const variant of variants) {
    if (checkCondition(variant.condition, meters)) {
      return variant;
    }
  }
  return null;
}

// Determine outcome based on final meters
function determineOutcome(meters: Meters, outcomes: Outcome[]): Outcome | null {
  for (const outcome of outcomes) {
    if (checkCondition(outcome.condition, meters)) {
      return outcome;
    }
  }
  return null;
}

export function useGameEngine({ locationId, toneId }: UseGameEngineProps) {
  const [gameState, setGameState] = useState<GameState>(() => ({
    seed: crypto.randomUUID(),
    locationId,
    toneId,
    dateCharacterId: "mina",
    turnIndex: 0,
    meters: { ...INITIAL_METERS },
    transcript: [],
    isComplete: false,
  }));

  const currentTurn: Turn | null = useMemo(() => {
    if (gameState.turnIndex >= episode1.turns.length) {
      return null;
    }
    return episode1.turns[gameState.turnIndex];
  }, [gameState.turnIndex]);

  // Get NPC line text and caption for current turn
  const currentNpcLine = useMemo(() => {
    if (!currentTurn) return { text: "", caption: "" };

    // If turn has direct npcLine, use it
    if (currentTurn.npcLine) {
      return {
        text: currentTurn.npcLine.text,
        caption: currentTurn.npcLine.caption,
      };
    }

    // If turn has variants, select based on conditions
    if (currentTurn.npcLineVariants) {
      const variant = selectNpcLineVariant(currentTurn.npcLineVariants, gameState.meters);
      if (variant) {
        return {
          text: variant.text,
          caption: variant.caption,
        };
      }
    }

    return { text: "", caption: "" };
  }, [currentTurn, gameState.meters]);

  // Clamp meter value to configured range
  const clampMeter = useCallback((value: number, meterName: keyof Meters): number => {
    const config = METER_CONFIG[meterName];
    return Math.max(config.min, Math.min(config.max, value));
  }, []);

  const applyMeterDelta = useCallback(
    (current: Meters, delta: MeterDelta): Meters => {
      return {
        trust: clampMeter(current.trust + delta.trust, "trust"),
        chemistry: clampMeter(current.chemistry + delta.chemistry, "chemistry"),
        affection: clampMeter(current.affection + delta.affection, "affection"),
      };
    },
    [clampMeter]
  );

  const makeChoice = useCallback(
    (choiceId: string) => {
      if (!currentTurn) return null;

      const choice = currentTurn.choices.find((c) => c.choiceId === choiceId);
      if (!choice) return null;

      setGameState((prev) => {
        const newMeters = applyMeterDelta(prev.meters, choice.meterDelta);
        const newTranscriptEntry: TranscriptEntry = {
          turnId: currentTurn.turnId,
          npcLine: currentNpcLine.text,
          choiceId: choice.choiceId,
          meterDelta: choice.meterDelta,
        };
        const nextTurnIndex = prev.turnIndex + 1;
        const isComplete = currentTurn.endEpisode || nextTurnIndex >= episode1.turns.length;

        return {
          ...prev,
          meters: newMeters,
          transcript: [...prev.transcript, newTranscriptEntry],
          turnIndex: nextTurnIndex,
          isComplete,
        };
      });

      return choice;
    },
    [currentTurn, currentNpcLine.text, applyMeterDelta]
  );

  const resetGame = useCallback(() => {
    setGameState({
      seed: crypto.randomUUID(),
      locationId,
      toneId,
      dateCharacterId: "mina",
      turnIndex: 0,
      meters: { ...INITIAL_METERS },
      transcript: [],
      isComplete: false,
    });
  }, [locationId, toneId]);

  // Apply custom meter delta (for free-form responses) and advance turn
  const applyCustomResponse = useCallback(
    (delta: MeterDelta, npcResponse: string) => {
      if (!currentTurn) return;

      setGameState((prev) => {
        const newMeters = applyMeterDelta(prev.meters, delta);
        const newTranscriptEntry: TranscriptEntry = {
          turnId: currentTurn.turnId,
          npcLine: npcResponse,
          choiceId: "custom",
          meterDelta: delta,
        };
        const nextTurnIndex = prev.turnIndex + 1;
        const isComplete = currentTurn.endEpisode || nextTurnIndex >= episode1.turns.length;

        return {
          ...prev,
          meters: newMeters,
          transcript: [...prev.transcript, newTranscriptEntry],
          turnIndex: nextTurnIndex,
          isComplete,
        };
      });
    },
    [currentTurn, applyMeterDelta]
  );

  // Get current shot template
  const currentShotTemplate = useMemo(() => {
    if (!currentTurn) return "";
    return episode1.promptTemplates.shotTemplates[currentTurn.shotTemplateId] || "";
  }, [currentTurn]);

  // Get outcome when game is complete
  const outcome = useMemo(() => {
    if (!gameState.isComplete) return null;
    return determineOutcome(gameState.meters, episode1.outcomes);
  }, [gameState.isComplete, gameState.meters]);

  return {
    gameState,
    currentTurn,
    currentNpcLine,
    currentShotTemplate,
    makeChoice,
    resetGame,
    applyCustomResponse,
    outcome,
    totalTurns: episode1.turns.length,
    meterConfig: METER_CONFIG,
    globalConstraints: episode1.promptTemplates.globalConstraints,
    driftResetPrompt: episode1.devTools.driftResetPrompt,
  };
}

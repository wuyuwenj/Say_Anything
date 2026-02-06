"use client";

import { useState, Suspense, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGameEngine } from "@/lib/useGameEngine";
import { LocationId, ToneId, Gender } from "@/lib/types";
import { getLocation, getTone } from "@/content/setupOptions";
import { getDateCharacter } from "@/content/characters";
import { VideoPanel, useOdysseyInteract } from "@/components/game/VideoPanel";
import { buildInitialPrompt, buildReactionPrompt, DateCharacterInfo, PlayerInfo } from "@/lib/promptBuilder";

export default function PlayPage() {
  return (
    <Suspense fallback={<PlayPageLoading />}>
      <PlayPageContent />
    </Suspense>
  );
}

function PlayPageLoading() {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </main>
  );
}

function PlayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get setup params
  const locationId = (searchParams.get("location") || "neon_cafe") as LocationId;
  const toneId = (searchParams.get("tone") || "cozy") as ToneId;
  const dateCharacterId = searchParams.get("dateCharacterId") || "mina";

  // Load character data from sessionStorage
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [dateCharacter, setDateCharacter] = useState<DateCharacterInfo | null>(null);

  useEffect(() => {
    // Load player info (simplified - just name and gender for context)
    const playerData = sessionStorage.getItem("playerCharacter");
    if (playerData) {
      const parsed = JSON.parse(playerData);
      setPlayerInfo({
        name: parsed.name || "You",
        gender: parsed.gender || "male",
      });
    } else {
      // Default fallback
      setPlayerInfo({
        name: "You",
        gender: "male",
      });
    }

    // Load date character
    const dateData = sessionStorage.getItem("dateCharacter");
    if (dateData) {
      setDateCharacter(JSON.parse(dateData));
    } else {
      // Fallback to preset character
      const preset = getDateCharacter(dateCharacterId);
      if (preset) {
        setDateCharacter({
          id: preset.characterId,
          name: preset.displayName,
          gender: preset.gender,
          appearance: preset.appearancePrompt,
        });
      } else {
        // Ultimate fallback to Mina
        const mina = getDateCharacter("mina")!;
        setDateCharacter({
          id: mina.characterId,
          name: mina.displayName,
          gender: mina.gender,
          appearance: mina.appearancePrompt,
        });
      }
    }
  }, [dateCharacterId]);

  // Game engine
  const {
    gameState,
    currentTurn,
    currentNpcLine,
    makeChoice,
    applyCustomResponse,
    totalTurns,
    meterConfig,
  } = useGameEngine({ locationId, toneId });

  // UI state
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const [hideUI, setHideUI] = useState(false);

  // Custom input state
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customLoading, setCustomLoading] = useState(false);
  const [customNpcResponse, setCustomNpcResponse] = useState<string | null>(null);

  // Manual UI visibility toggle
  const [manualHideUI, setManualHideUI] = useState(false);

  // Odyssey interact hook
  const { interact } = useOdysseyInteract();

  const location = getLocation(locationId);
  const tone = getTone(toneId);

  // API key from environment
  const apiKey = process.env.NEXT_PUBLIC_ODYSSEY_API_KEY || "";

  // Build prompt config
  const promptConfig = useMemo(() => {
    if (!playerInfo || !dateCharacter) return null;
    return {
      locationId,
      toneId,
      player: playerInfo,
      dateCharacter,
    };
  }, [locationId, toneId, playerInfo, dateCharacter]);

  // Build initial prompt for stream start
  const initialPrompt = useMemo(() => {
    if (!currentTurn || !promptConfig) return "";
    return buildInitialPrompt(promptConfig, {
      shotTemplateId: currentTurn.shotTemplateId,
      sceneContext: "The date is just beginning. Two people meeting for the first time, sitting across from each other.",
    });
  }, [promptConfig, currentTurn]);

  // Handle game completion
  useEffect(() => {
    if (gameState.isComplete) {
      const params = new URLSearchParams({
        trust: gameState.meters.trust.toString(),
        chemistry: gameState.meters.chemistry.toString(),
        affection: gameState.meters.affection.toString(),
      });
      router.push(`/results?${params.toString()}`);
    }
  }, [gameState.isComplete, gameState.meters, router]);

  // Handle choice selection
  const handleChoice = useCallback(
    async (choiceId: string) => {
      if (!currentTurn || !promptConfig) return;

      const choice = currentTurn.choices.find((c) => c.choiceId === choiceId);
      if (!choice) return;

      setSelectedChoice(choiceId);
      setIsTyping(true);

      // Hide UI after a brief moment so player can see their selection
      setTimeout(() => {
        setHideUI(true);
      }, 500);

      // Build and send reaction prompt to Odyssey
      if (streamReady && apiKey) {
        const reactionPrompt = buildReactionPrompt(promptConfig, {
          reactionPrompt: choice.reactionPrompt,
          shotTemplateId: currentTurn.shotTemplateId,
        });

        console.log("[Play] Sending reaction prompt:", choice.reactionPrompt.slice(0, 50) + "...");
        await interact(reactionPrompt);
      }

      // Wait for reaction to play out, then advance turn
      setTimeout(() => {
        setShowTransition(true);
        setTimeout(() => {
          setIsTyping(false);
          makeChoice(choiceId);
          setSelectedChoice(null);
          setShowTransition(false);
          setHideUI(false); // Show UI again for next turn
        }, 300); // Brief transition fade
      }, 3500); // Give more time to watch reaction (was 2700)
    },
    [currentTurn, promptConfig, streamReady, apiKey, interact, makeChoice]
  );

  // Handle custom text input submission
  const handleCustomSubmit = useCallback(
    async () => {
      if (!customText.trim() || !currentTurn || !promptConfig || !dateCharacter) return;

      setCustomLoading(true);
      setIsTyping(true);

      // Hide UI after a brief moment
      setTimeout(() => {
        setHideUI(true);
      }, 500);

      try {
        // Build conversation context from recent transcript
        const recentContext = gameState.transcript
          .slice(-3)
          .map((entry) => `Player chose: ${entry.choiceId}\nNPC said: ${entry.npcLine}`)
          .join("\n\n");

        // Call the evaluate API
        const response = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMessage: customText,
            characterName: dateCharacter.name,
            characterGender: dateCharacter.gender,
            characterPersonality: "friendly, warm, engaging", // Default personality
            currentMood: toneId,
            conversationContext: recentContext || currentNpcLine.text,
            location: location?.label || "cafe",
          }),
        });

        const data = await response.json();

        // Store the NPC response for display
        setCustomNpcResponse(data.npcDialogue);

        // Send the odysseyPrompt to Odyssey for visual reaction
        if (streamReady && apiKey && data.odysseyPrompt) {
          const fullPrompt = buildReactionPrompt(promptConfig, {
            reactionPrompt: data.odysseyPrompt,
            shotTemplateId: currentTurn.shotTemplateId,
          });
          console.log("[Play] Sending custom reaction:", data.odysseyPrompt.slice(0, 50) + "...");
          await interact(fullPrompt);
        }

        // Wait for reaction, then advance
        setTimeout(() => {
          setShowTransition(true);
          setTimeout(() => {
            // Apply meter changes and advance turn using the game engine
            applyCustomResponse(data.meterDelta, data.npcDialogue);

            setIsTyping(false);
            setCustomLoading(false);
            setShowCustomInput(false);
            setCustomText("");
            setCustomNpcResponse(null);
            setShowTransition(false);
            setHideUI(false);
          }, 300);
        }, 3500);
      } catch (error) {
        console.error("Failed to evaluate custom response:", error);
        setCustomLoading(false);
        setIsTyping(false);
        setHideUI(false);
      }
    },
    [customText, currentTurn, promptConfig, dateCharacter, gameState.transcript, currentNpcLine.text, toneId, location, streamReady, apiKey, interact, applyCustomResponse]
  );

  // Keyboard shortcuts for choices (1, 2, 3) and UI toggle (H)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // H key to toggle UI visibility
      if (e.key === "h" || e.key === "H") {
        setManualHideUI((prev) => !prev);
        return;
      }

      if (isTyping || !currentTurn) return;

      const key = e.key;
      if (key === "1" || key === "2" || key === "3") {
        const index = parseInt(key) - 1;
        const choice = currentTurn.choices[index];
        if (choice) {
          handleChoice(choice.choiceId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTyping, currentTurn, handleChoice]);

  // Wait for characters to load
  if (!currentTurn || !dateCharacter) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </main>
    );
  }

  // Check if API key is configured
  const hasApiKey = Boolean(apiKey);

  return (
    <main className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Full-screen Video Container */}
      <div className="flex-1 relative">
        {/* Video Panel - Full screen */}
        {hasApiKey ? (
          <VideoPanel
            apiKey={apiKey}
            initialPrompt={initialPrompt}
            locationLabel={location?.label || ""}
            toneLabel={tone?.label || ""}
            characterName={dateCharacter.name}
            onStreamReady={() => setStreamReady(true)}
            onStreamError={(error) => setStreamError(error)}
          />
        ) : (
          // Fallback placeholder when no API key
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-slate-800 to-pink-900 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="text-5xl">{dateCharacter.name[0]}</span>
              </div>
              <p className="text-lg">Video stream disabled</p>
              <p className="text-sm mt-1 text-yellow-400">
                Set NEXT_PUBLIC_ODYSSEY_API_KEY to enable
              </p>
              <p className="text-sm mt-2">{location?.label} | {tone?.label}</p>
            </div>
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div
          className={`absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-900/95 via-slate-900/50 to-transparent pointer-events-none transition-opacity duration-500 ${
            hideUI || manualHideUI ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Top HUD - Turn Counter & Meters */}
        <div className="absolute top-0 inset-x-0 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Link href="/setup">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  Exit
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setManualHideUI(!manualHideUI)}
                className="text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm"
              >
                {manualHideUI ? "Show UI" : "Hide UI"}
              </Button>
              <div className="text-white bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-white/70">Turn</span>{" "}
                <span className="font-bold">{gameState.turnIndex + 1}</span>
                <span className="text-white/70"> / {totalTurns}</span>
              </div>
            </div>

            {/* Meters */}
            <div className="flex gap-4 bg-slate-900/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <MeterDisplay
                label="Trust"
                value={gameState.meters.trust}
                min={meterConfig.trust.min}
                max={meterConfig.trust.max}
                color="bg-blue-500"
              />
              <MeterDisplay
                label="Chemistry"
                value={gameState.meters.chemistry}
                min={meterConfig.chemistry.min}
                max={meterConfig.chemistry.max}
                color="bg-pink-500"
              />
              <MeterDisplay
                label="Affection"
                value={gameState.meters.affection}
                min={meterConfig.affection.min}
                max={meterConfig.affection.max}
                color="bg-red-500"
              />
            </div>
          </div>
        </div>

        {/* Bottom Overlay - Dialogue & Choices */}
        <div
          className={`absolute bottom-0 inset-x-0 z-10 p-4 md:p-6 transition-all duration-500 ${
            hideUI || manualHideUI ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-4">
            {/* NPC Dialogue */}
            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0 ring-2 ring-white/20">
                  <span className="text-xl font-bold text-white">{dateCharacter.name[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-purple-400 font-medium mb-1">{dateCharacter.name}</p>
                  <p className="text-white text-lg leading-relaxed">
                    {customNpcResponse || currentNpcLine.text}
                  </p>
                  {!customNpcResponse && currentNpcLine.caption && (
                    <p className="text-sm text-slate-400 italic mt-2">{currentNpcLine.caption}</p>
                  )}
                </div>
              </div>

              {/* Typing indicator */}
              {isTyping && (
                <div className="mt-3 flex items-center gap-2 text-slate-400">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-sm">{dateCharacter.name} is thinking...</span>
                </div>
              )}
            </div>

            {/* Choice Buttons */}
            <div className="flex flex-col gap-2">
              {currentTurn.choices.map((choice, index) => {
                const isSelected = selectedChoice === choice.choiceId;
                return (
                  <Button
                    key={choice.choiceId}
                    variant="outline"
                    className={`h-auto py-3 px-4 text-left justify-start backdrop-blur-md transition-all whitespace-normal break-words ${
                      isSelected
                        ? "border-purple-500 bg-purple-600/40 ring-2 ring-purple-500/50"
                        : "bg-slate-900/70 border-white/20 hover:bg-slate-800/80 hover:border-purple-500"
                    } ${isTyping && !isSelected ? "opacity-40" : ""}`}
                    onClick={() => handleChoice(choice.choiceId)}
                    disabled={isTyping || showCustomInput}
                  >
                    <span className={`font-mono mr-3 shrink-0 ${isSelected ? "text-purple-300" : "text-purple-400"}`}>
                      {isSelected ? "✓" : index + 1}
                    </span>
                    <span className="text-white break-words">{choice.playerText}</span>
                  </Button>
                );
              })}

              {/* Custom Input Section */}
              {!showCustomInput ? (
                <Button
                  variant="outline"
                  className="h-auto py-3 px-4 text-left justify-start backdrop-blur-md bg-slate-900/70 border-white/20 hover:bg-slate-800/80 hover:border-cyan-500 border-dashed"
                  onClick={() => setShowCustomInput(true)}
                  disabled={isTyping}
                >
                  <span className="font-mono mr-3 text-cyan-400">+</span>
                  <span className="text-white/70 italic">Say something else...</span>
                </Button>
              ) : (
                <div className="bg-slate-900/80 backdrop-blur-md rounded-lg p-3 border border-cyan-500/50 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && customText.trim()) {
                          handleCustomSubmit();
                        } else if (e.key === "Escape") {
                          setShowCustomInput(false);
                          setCustomText("");
                        }
                      }}
                      placeholder="Type your response or action (e.g., 'I got you some flowers')"
                      className="flex-1 bg-slate-800/80 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500"
                      disabled={customLoading}
                      autoFocus
                    />
                    <Button
                      onClick={handleCustomSubmit}
                      disabled={!customText.trim() || customLoading}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white px-4"
                    >
                      {customLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </span>
                      ) : (
                        "Send"
                      )}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-white/40">
                      Try actions like: "I compliment your smile" or "I order us some drinks"
                    </p>
                    <button
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomText("");
                      }}
                      className="text-xs text-white/40 hover:text-white/60"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard hints */}
            <p className="text-xs text-center text-white/40">
              Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60">1</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60">2</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60">3</kbd> to choose |{" "}
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60">H</kbd> to hide UI
            </p>
          </div>
        </div>

        {/* Scene transition overlay */}
        {showTransition && (
          <div className="absolute inset-0 bg-slate-900 z-30 animate-pulse" />
        )}

        {/* Stream error display */}
        {streamError && (
          <div className="absolute top-20 left-4 right-4 z-20 p-3 bg-red-900/80 backdrop-blur-sm border border-red-700 rounded-lg text-sm text-red-300">
            Stream error: {streamError}
          </div>
        )}
      </div>
    </main>
  );
}

interface MeterDisplayProps {
  label: string;
  value: number;
  min: number;
  max: number;
  color: string;
}

function MeterDisplay({ label, value, min, max, color }: MeterDisplayProps) {
  const range = max - min;
  const percentage = ((value - min) / range) * 100;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">{label}</span>
      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-white font-mono w-6 text-right">{value}</span>
    </div>
  );
}

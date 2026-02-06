"use client";

import { useState, Suspense, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGameEngine } from "@/lib/useGameEngine";
import { LocationId, ToneId, Gender } from "@/lib/types";
import { getLocation, getTone } from "@/content/setupOptions";
import { getDateCharacter } from "@/content/characters";
import { VideoPanel, useOdysseyInteract } from "@/components/game/VideoPanel";
import { buildInitialPrompt, buildReactionPrompt, DateCharacterInfo, PlayerInfo } from "@/lib/promptBuilder";

const characterIcons: Record<string, string> = {
  mina: "solar:user-heart-linear",
  kai: "solar:user-linear",
  luna: "solar:stars-minimalistic-linear",
  alex: "solar:glasses-linear",
  river: "solar:music-note-linear",
  custom: "solar:user-linear",
};

const characterColors: Record<string, { bg: string; text: string; border: string }> = {
  mina: { bg: "bg-rose-200", text: "text-rose-500", border: "border-rose-100" },
  kai: { bg: "bg-sky-200", text: "text-sky-500", border: "border-sky-100" },
  luna: { bg: "bg-purple-200", text: "text-purple-500", border: "border-purple-100" },
  alex: { bg: "bg-emerald-200", text: "text-emerald-500", border: "border-emerald-100" },
  river: { bg: "bg-amber-200", text: "text-amber-500", border: "border-amber-100" },
  custom: { bg: "bg-gray-200", text: "text-gray-500", border: "border-gray-100" },
};

export default function PlayPage() {
  return (
    <Suspense fallback={<PlayPageLoading />}>
      <PlayPageContent />
    </Suspense>
  );
}

function PlayPageLoading() {
  return (
    <div className="play-page min-h-screen flex items-center justify-center">
      <div className="text-white bubbly-font text-xl">Loading...</div>
    </div>
  );
}

function PlayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const locationId = (searchParams.get("location") || "neon_cafe") as LocationId;
  const toneId = (searchParams.get("tone") || "cozy") as ToneId;
  const dateCharacterId = searchParams.get("dateCharacterId") || "mina";

  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [dateCharacter, setDateCharacter] = useState<DateCharacterInfo | null>(null);

  useEffect(() => {
    const playerData = sessionStorage.getItem("playerCharacter");
    if (playerData) {
      const parsed = JSON.parse(playerData);
      setPlayerInfo({ name: parsed.name || "You", gender: parsed.gender || "male" });
    } else {
      setPlayerInfo({ name: "You", gender: "male" });
    }

    const dateData = sessionStorage.getItem("dateCharacter");
    if (dateData) {
      setDateCharacter(JSON.parse(dateData));
    } else {
      const preset = getDateCharacter(dateCharacterId);
      if (preset) {
        setDateCharacter({
          id: preset.characterId,
          name: preset.displayName,
          gender: preset.gender,
          appearance: preset.appearancePrompt,
        });
      } else {
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

  const {
    gameState,
    currentTurn,
    currentNpcLine,
    makeChoice,
    applyCustomResponse,
    totalTurns,
    meterConfig,
  } = useGameEngine({ locationId, toneId });

  const [isTyping, setIsTyping] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const [hideUI, setHideUI] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customLoading, setCustomLoading] = useState(false);
  const [customNpcResponse, setCustomNpcResponse] = useState<string | null>(null);
  const [manualHideUI, setManualHideUI] = useState(false);

  const { interact } = useOdysseyInteract();
  const location = getLocation(locationId);
  const tone = getTone(toneId);
  const apiKey = process.env.NEXT_PUBLIC_ODYSSEY_API_KEY || "";

  const promptConfig = useMemo(() => {
    if (!playerInfo || !dateCharacter) return null;
    return { locationId, toneId, player: playerInfo, dateCharacter };
  }, [locationId, toneId, playerInfo, dateCharacter]);

  const initialPrompt = useMemo(() => {
    if (!currentTurn || !promptConfig) return "";
    return buildInitialPrompt(promptConfig, {
      shotTemplateId: currentTurn.shotTemplateId,
      sceneContext: "The date is just beginning. Two people meeting for the first time, sitting across from each other.",
    });
  }, [promptConfig, currentTurn]);

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

  const handleChoice = useCallback(
    async (choiceId: string) => {
      if (!currentTurn || !promptConfig) return;
      const choice = currentTurn.choices.find((c) => c.choiceId === choiceId);
      if (!choice) return;

      setSelectedChoice(choiceId);
      setIsTyping(true);
      setTimeout(() => setHideUI(true), 500);

      if (streamReady && apiKey) {
        const reactionPrompt = buildReactionPrompt(promptConfig, {
          reactionPrompt: choice.reactionPrompt,
          shotTemplateId: currentTurn.shotTemplateId,
        });
        await interact(reactionPrompt);
      }

      setTimeout(() => {
        setShowTransition(true);
        setTimeout(() => {
          setIsTyping(false);
          makeChoice(choiceId);
          setSelectedChoice(null);
          setShowTransition(false);
          setHideUI(false);
        }, 300);
      }, 3500);
    },
    [currentTurn, promptConfig, streamReady, apiKey, interact, makeChoice]
  );

  const handleCustomSubmit = useCallback(async () => {
    if (!customText.trim() || !currentTurn || !promptConfig || !dateCharacter) return;

    setCustomLoading(true);
    setIsTyping(true);
    setTimeout(() => setHideUI(true), 500);

    try {
      const recentContext = gameState.transcript
        .slice(-3)
        .map((entry) => `Player chose: ${entry.choiceId}\nNPC said: ${entry.npcLine}`)
        .join("\n\n");

      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: customText,
          characterName: dateCharacter.name,
          characterGender: dateCharacter.gender,
          characterPersonality: "friendly, warm, engaging",
          currentMood: toneId,
          conversationContext: recentContext || currentNpcLine.text,
          location: location?.label || "cafe",
        }),
      });

      const data = await response.json();
      setCustomNpcResponse(data.npcDialogue);

      if (streamReady && apiKey && data.odysseyPrompt) {
        const fullPrompt = buildReactionPrompt(promptConfig, {
          reactionPrompt: data.odysseyPrompt,
          shotTemplateId: currentTurn.shotTemplateId,
        });
        await interact(fullPrompt);
      }

      setTimeout(() => {
        setShowTransition(true);
        setTimeout(() => {
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
  }, [customText, currentTurn, promptConfig, dateCharacter, gameState.transcript, currentNpcLine.text, toneId, location, streamReady, apiKey, interact, applyCustomResponse]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "h" || e.key === "H") {
        setManualHideUI((prev) => !prev);
        return;
      }
      if (isTyping || !currentTurn) return;
      if (["1", "2", "3"].includes(e.key)) {
        const choice = currentTurn.choices[parseInt(e.key) - 1];
        if (choice) handleChoice(choice.choiceId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTyping, currentTurn, handleChoice]);

  if (!currentTurn || !dateCharacter) {
    return <PlayPageLoading />;
  }

  const charColors = characterColors[dateCharacter.id] || characterColors.mina;
  const charIcon = characterIcons[dateCharacter.id] || "solar:user-linear";
  const hasApiKey = Boolean(apiKey);

  const calcMeterPercent = (value: number, min: number, max: number) => Math.round(((value - min) / (max - min)) * 100);
  const trustPercent = calcMeterPercent(gameState.meters.trust, meterConfig.trust.min, meterConfig.trust.max);
  const chemistryPercent = calcMeterPercent(gameState.meters.chemistry, meterConfig.chemistry.min, meterConfig.chemistry.max);
  const affectionPercent = calcMeterPercent(gameState.meters.affection, meterConfig.affection.min, meterConfig.affection.max);

  return (
    <>
      <style jsx global>{`
        .play-page {
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
          box-shadow: 0 6px 0 rgba(0,0,0,0.1);
        }
        .pop-shadow:active {
          box-shadow: 0 0 0 rgba(0,0,0,0.1);
          transform: translateY(6px);
        }
        .video-gradient {
          background: radial-gradient(circle at center, rgba(40, 30, 60, 0.4) 0%, rgba(20, 15, 30, 0.9) 100%);
        }
        kbd {
          font-family: var(--font-fredoka), 'Fredoka', sans-serif;
          background: rgba(255,255,255,0.2);
          border-bottom: 2px solid rgba(255,255,255,0.4);
        }
      `}</style>

      <div className="play-page min-h-screen flex items-center justify-center selection:bg-[#98FF98] selection:text-gray-700 overflow-hidden">
        {/* Main Game Window - Full Screen */}
        <main className="relative z-10 w-full h-screen bg-[#2A2A35] overflow-hidden flex flex-col">
          <div className="relative w-full h-full flex flex-col">

            {/* Video Panel */}
            <div className="absolute inset-0 z-0">
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
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center">
                  <div className="absolute inset-0 video-gradient backdrop-blur-[2px]"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/90 space-y-6">
                    <div className={`w-32 h-32 rounded-full ${charColors.bg} border-[6px] border-white/20 flex items-center justify-center shadow-[0_0_40px_rgba(255,182,193,0.4)] animate-pulse`}>
                      <iconify-icon icon={charIcon} className={`${charColors.text} text-6xl`}></iconify-icon>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-xl md:text-2xl font-semibold tracking-wide flex items-center gap-2 justify-center opacity-70">
                        <iconify-icon icon="solar:videocamera-record-linear" className="animate-pulse text-red-400"></iconify-icon>
                        Video stream disabled
                      </p>
                      <p className="text-sm font-medium opacity-50 bg-black/30 px-4 py-1 rounded-full inline-block">Set NEXT_PUBLIC_ODYSSEY_API_KEY to enable</p>
                      <div className="mt-4 flex items-center justify-center gap-2 text-rose-200/80 font-semibold bubbly-font tracking-wide">
                        <iconify-icon icon="solar:map-point-linear"></iconify-icon>
                        <span>{location?.label}</span>
                        <span className="text-white/30">•</span>
                        <span>{tone?.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Top HUD */}
            <header className="relative z-20 w-full p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <Link href="/setup">
                  <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-2 border-white/30 rounded-full px-5 py-2 font-semibold text-sm transition-all flex items-center gap-2 active:scale-95">
                    <iconify-icon icon="solar:logout-2-linear" className="text-lg"></iconify-icon>
                    Exit
                  </button>
                </Link>
                <button
                  onClick={() => setManualHideUI(!manualHideUI)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-2 border-white/30 rounded-full w-10 h-10 flex items-center justify-center transition-all active:scale-95"
                >
                  <iconify-icon icon={manualHideUI ? "solar:eye-linear" : "solar:eye-closed-linear"} className="text-lg"></iconify-icon>
                </button>
                <div className="bg-[#87CEEB] border-[3px] border-white text-white px-5 py-1.5 rounded-full shadow-lg flex items-center gap-2 bubbly-font">
                  <span className="text-xs uppercase tracking-wider font-semibold opacity-90">Turn</span>
                  <div className="bg-white/20 px-2 rounded md:text-lg font-bold">{gameState.turnIndex + 1}</div>
                  <span className="text-xs font-semibold opacity-90">/ {totalTurns}</span>
                </div>
              </div>

              {/* Meters */}
              <div className="flex flex-wrap md:flex-nowrap gap-3 md:gap-6 bg-black/20 backdrop-blur-md p-2 rounded-[2rem] border border-white/10">
                <div className="flex items-center gap-3 px-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                    <iconify-icon icon="solar:shield-check-linear" className="text-lg"></iconify-icon>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="bubbly-font text-cyan-100 text-xs font-medium tracking-wide">Trust</label>
                    <div className="w-24 h-2.5 bg-gray-700/50 rounded-full overflow-hidden border border-white/10">
                      <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${trustPercent}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 border-l border-white/10">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                    <iconify-icon icon="solar:test-tube-minimalistic-linear" className="text-lg"></iconify-icon>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="bubbly-font text-violet-100 text-xs font-medium tracking-wide">Chemistry</label>
                    <div className="w-24 h-2.5 bg-gray-700/50 rounded-full overflow-hidden border border-white/10">
                      <div className="h-full bg-violet-400 rounded-full transition-all duration-500" style={{ width: `${chemistryPercent}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 border-l border-white/10">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                    <iconify-icon icon="solar:heart-linear" className="text-lg"></iconify-icon>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="bubbly-font text-rose-100 text-xs font-medium tracking-wide">Affection</label>
                    <div className="w-24 h-2.5 bg-gray-700/50 rounded-full overflow-hidden border border-white/10">
                      <div className="h-full bg-rose-400 rounded-full transition-all duration-500" style={{ width: `${affectionPercent}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Bottom Overlay */}
            <div className={`absolute bottom-0 left-0 w-full p-4 md:p-8 z-30 flex flex-col items-center gap-6 transition-all duration-500 ${hideUI || manualHideUI ? "opacity-0 translate-y-8 pointer-events-none" : "opacity-100 translate-y-0"}`}>

              {/* Dialogue Box */}
              <div className="w-full max-w-3xl bg-white/95 backdrop-blur-xl rounded-[2rem] p-1 border-[5px] border-white shadow-xl relative">
                <div className="flex flex-row items-stretch">
                  <div className="flex-shrink-0 relative -top-6 -left-2 md:-left-6">
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${charColors.bg} border-[5px] border-white shadow-lg flex items-center justify-center overflow-hidden`}>
                      <iconify-icon icon={charIcon} className={`${charColors.text} text-4xl`}></iconify-icon>
                    </div>
                    <div className={`absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 border-2 ${charColors.border} shadow-sm`}>
                      <iconify-icon icon="solar:chat-round-dots-linear" className={`${charColors.text} text-lg`}></iconify-icon>
                    </div>
                  </div>
                  <div className="flex-1 pr-6 py-4 md:pl-0 pl-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="bubbly-font text-[#FF6B6B] font-semibold text-lg md:text-xl tracking-tight">{dateCharacter.name}</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-700 text-base md:text-lg font-medium leading-relaxed">
                        {customNpcResponse || currentNpcLine.text}
                      </p>
                      {!customNpcResponse && currentNpcLine.caption && (
                        <p className="text-gray-400 text-xs md:text-sm font-semibold italic flex items-center gap-1.5">
                          <iconify-icon icon="solar:eye-linear"></iconify-icon>
                          {currentNpcLine.caption}
                        </p>
                      )}
                    </div>
                    {isTyping && (
                      <div className="mt-2 flex items-center gap-2 text-gray-400 text-xs font-semibold bg-gray-50 rounded-full px-3 py-1 w-fit">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                        </div>
                        <span>{dateCharacter.name} is thinking...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Choice Buttons */}
              <div className="w-full max-w-3xl flex flex-col gap-3">
                {currentTurn.choices.map((choice, index) => {
                  const isSelected = selectedChoice === choice.choiceId;
                  return (
                    <button
                      key={choice.choiceId}
                      onClick={() => handleChoice(choice.choiceId)}
                      disabled={isTyping || showCustomInput}
                      className={`group w-full text-left p-4 rounded-2xl border-[3px] shadow-md transition-all duration-200 flex items-center gap-4 ${
                        isSelected
                          ? "bg-[#87CEEB] border-white text-white"
                          : "bg-white hover:bg-[#87CEEB] border-white/60 hover:border-white hover:shadow-lg hover:-translate-y-0.5"
                      } ${isTyping && !isSelected ? "opacity-40" : ""}`}
                    >
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full font-bold bubbly-font flex items-center justify-center text-sm transition-colors ${
                        isSelected
                          ? "bg-white text-[#87CEEB]"
                          : "bg-gray-100 group-hover:bg-white text-gray-500 group-hover:text-[#87CEEB]"
                      }`}>
                        {isSelected ? "✓" : index + 1}
                      </span>
                      <span className={`font-semibold text-sm md:text-base leading-snug ${isSelected ? "text-white" : "text-gray-600 group-hover:text-white"}`}>
                        {choice.playerText}
                      </span>
                    </button>
                  );
                })}

                {/* Custom Input */}
                <div className="w-full flex flex-col gap-2">
                  {!showCustomInput ? (
                    <button
                      onClick={() => setShowCustomInput(true)}
                      disabled={isTyping}
                      className="w-full bg-white/40 hover:bg-white/60 backdrop-blur-sm border-2 border-white/50 border-dashed rounded-xl p-3 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <iconify-icon icon="solar:pen-new-square-linear" className="text-lg"></iconify-icon>
                      <span>Type your own response...</span>
                    </button>
                  ) : (
                    <div className="bg-white rounded-2xl p-4 border-[3px] border-white shadow-lg">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && customText.trim()) handleCustomSubmit();
                            else if (e.key === "Escape") { setShowCustomInput(false); setCustomText(""); }
                          }}
                          placeholder="Type your response or action (e.g., 'I got you some flowers')"
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:bg-white transition-all text-sm"
                          disabled={customLoading}
                          autoFocus
                        />
                        <button
                          onClick={handleCustomSubmit}
                          disabled={!customText.trim() || customLoading}
                          className="bubbly-font bg-[#87CEEB] hover:bg-[#7BC6E6] disabled:bg-gray-300 text-white px-6 rounded-xl font-bold pop-shadow transition-transform active:scale-95"
                        >
                          {customLoading ? "..." : "Send"}
                        </button>
                      </div>
                      <div className="mt-3 flex justify-between items-center text-xs">
                        <p className="text-gray-400 font-medium flex items-center gap-1">
                          <iconify-icon icon="solar:info-circle-linear"></iconify-icon>
                          Try actions: &quot;I compliment your smile&quot;
                        </p>
                        <button
                          onClick={() => { setShowCustomInput(false); setCustomText(""); }}
                          className="text-gray-400 hover:text-red-400 font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Keyboard Hints */}
              <div className="hidden md:flex items-center gap-3 text-white/50 text-xs font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
                <div className="flex gap-1">
                  <kbd className="px-1.5 py-0.5 rounded text-white font-mono shadow-sm">1</kbd>
                  <kbd className="px-1.5 py-0.5 rounded text-white font-mono shadow-sm">2</kbd>
                  <kbd className="px-1.5 py-0.5 rounded text-white font-mono shadow-sm">3</kbd>
                </div>
                <span>to choose</span>
                <span className="w-1 h-1 rounded-full bg-white/30"></span>
                <kbd className="px-1.5 py-0.5 rounded text-white font-mono shadow-sm">H</kbd>
                <span>hide UI</span>
              </div>
            </div>

            {/* Transition Overlay */}
            {showTransition && (
              <div className="absolute inset-0 bg-[#FFC0CB] z-50 flex items-center justify-center">
                <iconify-icon icon="solar:heart-linear" className="text-white text-8xl animate-ping"></iconify-icon>
              </div>
            )}

            {/* Error Display */}
            {streamError && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-xl backdrop-blur border border-red-400 shadow-xl z-50 flex items-center gap-3">
                <iconify-icon icon="solar:danger-triangle-linear" className="text-xl"></iconify-icon>
                <p className="font-medium text-sm">Stream error: <span>{streamError}</span></p>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}

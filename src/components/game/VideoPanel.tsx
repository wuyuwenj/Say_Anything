"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useOdyssey } from "@odysseyml/odyssey/react";

interface VideoPanelProps {
  apiKey: string;
  initialPrompt: string;
  locationLabel: string;
  toneLabel: string;
  characterName?: string;
  onStreamReady?: () => void;
  onStreamError?: (error: string) => void;
}

export function VideoPanel({
  apiKey,
  initialPrompt,
  locationLabel,
  toneLabel,
  characterName,
  onStreamReady,
  onStreamError,
}: VideoPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [streamStarted, setStreamStarted] = useState(false);

  // Refs to prevent duplicate operations (especially in React Strict Mode)
  const isConnectingRef = useRef(false);
  const hasStartedStreamRef = useRef(false);
  const isMountedRef = useRef(true);

  const odyssey = useOdyssey({
    apiKey,
    handlers: {
      onConnected: (mediaStream) => {
        if (!isMountedRef.current) return;
        console.log("[Odyssey] Connected with stream");
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(console.error);
        }
        setIsInitialized(true);
        isConnectingRef.current = false;
      },
      onDisconnected: () => {
        if (!isMountedRef.current) return;
        console.log("[Odyssey] Disconnected");
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setIsInitialized(false);
        setStreamStarted(false);
        isConnectingRef.current = false;
      },
      onStreamStarted: (streamId) => {
        if (!isMountedRef.current) return;
        console.log("[Odyssey] Stream started:", streamId);
        setStreamStarted(true);
        onStreamReady?.();
      },
      onStreamEnded: () => {
        if (!isMountedRef.current) return;
        console.log("[Odyssey] Stream ended");
        setStreamStarted(false);
        hasStartedStreamRef.current = false;
      },
      onInteractAcknowledged: (prompt) => {
        console.log("[Odyssey] Interaction acknowledged:", prompt.slice(0, 50) + "...");
      },
      onStreamError: (reason, message) => {
        // Ignore "Connection superseded" as it's expected in dev mode
        if (reason === "Connection superseded") {
          console.log("[Odyssey] Connection superseded (normal in dev mode)");
          return;
        }
        console.error("[Odyssey] Stream error:", reason, message);
        onStreamError?.(`${reason}: ${message}`);
      },
      onError: (error, fatal) => {
        // Ignore superseded errors
        if (error.message?.includes("superseded")) {
          console.log("[Odyssey] Superseded error ignored");
          return;
        }
        console.error("[Odyssey] Error:", error.message, "Fatal:", fatal);
        if (fatal && isMountedRef.current) {
          onStreamError?.(error.message);
        }
      },
    },
  });

  // Connect on mount - with guard against double-mounting
  useEffect(() => {
    isMountedRef.current = true;

    // Small delay to let React Strict Mode finish its remount cycle
    const connectTimeout = setTimeout(() => {
      // Prevent duplicate connection attempts
      if (isConnectingRef.current || odyssey.isConnected) {
        console.log("[Odyssey] Already connecting or connected, skipping...");
        return;
      }

      if (!isMountedRef.current) {
        console.log("[Odyssey] Component unmounted before connect, skipping...");
        return;
      }

      isConnectingRef.current = true;
      console.log("[Odyssey] Connecting...");

      odyssey
        .connect()
        .then(() => {
          if (isMountedRef.current) {
            console.log("[Odyssey] Connected successfully");
          }
        })
        .catch((err) => {
          // Ignore superseded errors
          if (err.message?.includes("superseded")) {
            console.log("[Odyssey] Connection superseded, will retry");
            isConnectingRef.current = false;
            return;
          }
          console.error("[Odyssey] Connection failed:", err.message);
          if (isMountedRef.current) {
            isConnectingRef.current = false;
            onStreamError?.(err.message);
          }
        });
    }, 100);

    return () => {
      console.log("[Odyssey] Cleaning up...");
      clearTimeout(connectTimeout);
      isMountedRef.current = false;
      isConnectingRef.current = false;
      hasStartedStreamRef.current = false;
      odyssey.disconnect();
    };
  }, []);

  // Start stream once connected (only once)
  useEffect(() => {
    if (isInitialized && !hasStartedStreamRef.current && initialPrompt && isMountedRef.current) {
      hasStartedStreamRef.current = true;
      console.log("[Odyssey] Starting stream with initial prompt...");

      odyssey
        .startStream({
          prompt: initialPrompt,
          portrait: false,
        })
        .then((streamId) => {
          console.log("[Odyssey] Stream ID:", streamId);
        })
        .catch((err) => {
          console.error("[Odyssey] Failed to start stream:", err.message);
          if (isMountedRef.current) {
            hasStartedStreamRef.current = false;
            onStreamError?.(err.message);
          }
        });
    }
  }, [isInitialized, initialPrompt]);

  // Expose interact function
  const sendInteraction = useCallback(
    async (prompt: string) => {
      if (!streamStarted) {
        console.warn("[Odyssey] Cannot interact - stream not started");
        return false;
      }
      try {
        console.log("[Odyssey] Sending interaction...");
        await odyssey.interact({ prompt });
        return true;
      } catch (err) {
        console.error("[Odyssey] Interact failed:", err);
        return false;
      }
    },
    [streamStarted, odyssey]
  );

  // Attach sendInteraction to window for access from parent
  useEffect(() => {
    (window as unknown as { odysseyInteract: typeof sendInteraction }).odysseyInteract = sendInteraction;
    return () => {
      delete (window as unknown as { odysseyInteract?: typeof sendInteraction }).odysseyInteract;
    };
  }, [sendInteraction]);

  return (
    <div className="absolute inset-0 bg-slate-900">
      {/* Video element - full screen */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Loading overlay - shown before stream starts */}
      {!streamStarted && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-slate-800 to-pink-900 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
              {odyssey.status === "connecting" || odyssey.status === "authenticating" ? (
                <div className="w-12 h-12 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-5xl">{characterName?.[0] || "?"}</span>
              )}
            </div>
            <p className="text-lg">
              {odyssey.status === "connecting"
                ? "Connecting..."
                : odyssey.status === "authenticating"
                ? "Authenticating..."
                : odyssey.status === "connected" && !streamStarted
                ? `Meeting ${characterName || "your date"}...`
                : `${locationLabel} | ${toneLabel}`}
            </p>
            {odyssey.error && !odyssey.error.includes("superseded") && (
              <p className="text-sm text-red-400 mt-3">{odyssey.error}</p>
            )}
          </div>
        </div>
      )}

      {/* Status indicator - moved to avoid overlap with HUD */}
      <div className="absolute top-16 right-4 flex items-center gap-2 z-5">
        <div
          className={`w-2 h-2 rounded-full ${
            streamStarted
              ? "bg-green-500"
              : isInitialized
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
        />
        <span className="text-xs text-white/70 bg-slate-900/60 backdrop-blur-sm px-2 py-1 rounded">
          {streamStarted ? "Live" : odyssey.status}
        </span>
      </div>
    </div>
  );
}

// Export a hook for parent components to trigger interactions
export function useOdysseyInteract() {
  const interact = useCallback(async (prompt: string): Promise<boolean> => {
    const odysseyInteract = (window as unknown as { odysseyInteract?: (p: string) => Promise<boolean> })
      .odysseyInteract;
    if (odysseyInteract) {
      return odysseyInteract(prompt);
    }
    console.warn("Odyssey interact not available");
    return false;
  }, []);

  return { interact };
}

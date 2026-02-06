import { LocationId, ToneId, Gender } from "./types";
import { getLocation, getTone } from "@/content/setupOptions";
import { episode1 } from "@/content/episode1";

// Stored character info from setup
export interface DateCharacterInfo {
  id: string;
  name: string;
  gender: Gender;
  appearance: string;
  imageUrl?: string;
}

// Simplified player info (for context, not shown in video)
export interface PlayerInfo {
  name: string;
  gender: Gender;
}

interface PromptBuilderConfig {
  locationId: LocationId;
  toneId: ToneId;
  player: PlayerInfo;
  dateCharacter: DateCharacterInfo;
}

interface ScenePromptOptions {
  shotTemplateId: string;
  sceneContext?: string;
}

interface ReactionPromptOptions {
  reactionPrompt: string;
  shotTemplateId: string;
}

/**
 * Builds the initial scene prompt to start the stream.
 * First-person POV - only shows the date character
 */
export function buildInitialPrompt(
  config: PromptBuilderConfig,
  options: ScenePromptOptions
): string {
  const location = getLocation(config.locationId);
  const tone = getTone(config.toneId);

  const parts: string[] = [];

  // Character count - CRITICAL
  parts.push(`ONE PERSON ONLY. Do not add a second person. Do not show the viewer. Only show ${config.dateCharacter.name}.`);

  // Scene setup with table
  parts.push(`${config.dateCharacter.name} sitting behind a table, facing the camera. Table edge and drinks visible at bottom of frame. ${config.dateCharacter.appearance}`);

  // Framing
  parts.push(`Medium shot framing. Full face visible, head in upper portion of frame, shoulders and chest visible, table at bottom edge.`);

  // Location/background
  if (location) {
    parts.push(`Location: ${location.worldBiblePrompt}`);
  }

  // Tone
  if (tone) {
    parts.push(`Mood: ${tone.promptKit}`);
  }

  return parts.join("\n\n");
}

/**
 * Builds a reaction prompt after a player makes a choice.
 * First-person POV - date character reacts to us
 */
export function buildReactionPrompt(
  config: PromptBuilderConfig,
  options: ReactionPromptOptions
): string {
  const tone = getTone(config.toneId);
  const location = getLocation(config.locationId);

  const parts: string[] = [];

  // Keep one person
  parts.push(`ONE PERSON ONLY. Keep showing only ${config.dateCharacter.name}.`);

  // Scene continuity - CRITICAL for smooth transitions
  parts.push(`MAINTAIN SCENE CONTINUITY: Keep the existing drinks/glasses on the table. Do not remove any objects already in the scene. New objects should appear alongside existing ones, not replace them.`);

  // Reaction directive
  parts.push(`${config.dateCharacter.name} reacts: ${options.reactionPrompt}`);

  // Continuity
  parts.push(`Same table with drinks, same location, same framing. Table visible at bottom of frame. Smooth gradual transition - no sudden object changes.`);

  return parts.join("\n\n");
}

/**
 * Builds a drift reset prompt to recover from visual drift.
 */
export function buildDriftResetPrompt(config: PromptBuilderConfig): string {
  const location = getLocation(config.locationId);

  const parts: string[] = [];

  // Base drift reset
  parts.push(episode1.devTools.driftResetPrompt);

  // Re-anchor location
  if (location) {
    parts.push(`Location: ${location.label}`);
  }

  // Re-anchor character in first-person
  parts.push(`First-person view of ${config.dateCharacter.name}: ${config.dateCharacter.appearance}`);
  parts.push(`Only ${config.dateCharacter.name} visible, facing camera.`);

  return parts.join("\n\n");
}

/**
 * Builds a scene transition prompt when moving between scenes.
 */
export function buildSceneTransitionPrompt(
  config: PromptBuilderConfig,
  options: {
    fromSceneId: string;
    toSceneId: string;
    shotTemplateId: string;
    transitionContext?: string;
  }
): string {
  const tone = getTone(config.toneId);
  const shotTemplate = episode1.promptTemplates.shotTemplates[options.shotTemplateId] || "";

  const parts: string[] = [];

  // Transition context
  if (options.transitionContext) {
    parts.push(options.transitionContext);
  }

  // Character reminder for first-person
  parts.push(`First-person POV continues. ${config.dateCharacter.name} (${config.dateCharacter.gender}) facing camera.`);

  // New shot template
  if (shotTemplate) {
    parts.push(shotTemplate);
  }

  // Tone
  if (tone) {
    parts.push(tone.promptKit);
  }

  // Continuity
  parts.push(`Smooth transition. Same ${config.dateCharacter.name}, same outfit. First-person view. Stable camera.`);

  return parts.join("\n\n");
}

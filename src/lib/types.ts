// Game State Types

export type LocationId = "neon_cafe" | "rooftop_overlook";
export type ToneId = "cozy" | "comedy" | "romantic" | "dramatic";
export type DateIdeaId = "coffee_talk" | "night_walk";
export type Gender = "male" | "female" | "non-binary";

// Character for date partner (NPC)
export type DateCharacterId = "mina" | "kai" | "luna" | "alex" | "river" | "custom";

// Meters now range from -3 to 6, starting at 0
export interface Meters {
  trust: number;
  chemistry: number;
  affection: number;
}

export interface MeterDelta {
  trust: number;
  chemistry: number;
  affection: number;
}

export interface MeterConfig {
  min: number;
  max: number;
  start: number;
}

// Conditions for variant selection and outcomes
export interface Condition {
  chemistryAtLeast?: number;
  chemistryAtMost?: number;
  trustAtLeast?: number;
  trustAtMost?: number;
  affectionAtLeast?: number;
  affectionAtMost?: number;
}

// Choice structure
export interface Choice {
  choiceId: string;
  playerText: string;
  meterDelta: MeterDelta;
  reactionPrompt: string;
}

// NPC line variants
export interface NpcLineVariant {
  variantId: string;
  condition: Condition;
  text: string;
  caption: string;
}

export interface NpcLine {
  lineId: string;
  text: string;
  caption: string;
}

// Turn structure
export interface Turn {
  turnId: string;
  sceneId: string;
  shotTemplateId: string;
  npcLine?: NpcLine;
  npcLineVariants?: NpcLineVariant[];
  choices: Choice[];
  next?: { defaultTurnId: string };
  endEpisode?: boolean;
}

// Outcome structure
export interface Outcome {
  outcomeId: string;
  label: string;
  condition: Condition;
  uiSummary: string;
}

// Episode structure
export interface Episode {
  schemaVersion: string;
  gameId: string;
  episodeId: string;
  title: string;
  meters: Record<string, MeterConfig>;
  turns: Turn[];
  outcomes: Outcome[];
  promptTemplates: {
    shotTemplates: Record<string, string>;
    globalConstraints: string;
  };
  devTools: {
    driftResetPrompt: string;
    notes: string[];
  };
}

// Transcript entry
export interface TranscriptEntry {
  turnId: string;
  npcLine: string;
  choiceId: string;
  meterDelta: MeterDelta;
}

// Game state
export interface GameState {
  seed: string;
  locationId: LocationId;
  toneId: ToneId;
  dateCharacterId: DateCharacterId;
  turnIndex: number;
  meters: Meters;
  transcript: TranscriptEntry[];
  isComplete: boolean;
}

// Setup option types
export interface ToneOption {
  toneId: ToneId;
  label: string;
  promptKit: string;
}

export interface LocationOption {
  locationId: LocationId;
  label: string;
  worldBiblePrompt: string;
}

export interface DateIdeaOption {
  dateIdeaId: DateIdeaId;
  label: string;
  promptKit: string;
}

// Player character (the user playing)
export interface PlayerCharacter {
  name: string;
  gender: Gender;
  appearancePrompt: string;
  imageUrl?: string; // Optional uploaded image for reference
}

// Date character (NPC partner)
export interface DateCharacter {
  characterId: DateCharacterId;
  displayName: string;
  gender: Gender;
  appearancePrompt: string;
  personalityTags: string[];
  imageUrl?: string; // Optional reference image
  ui: {
    avatarKey: string;
    nameplate: string;
    typingIndicatorText: string;
  };
}

// Legacy Character type for backwards compatibility
export interface Character {
  characterId: string;
  displayName: string;
  role: string;
  genderPresentation: string;
  appearancePrompt: string;
  personalityTags: string[];
  ui: {
    avatarKey: string;
    nameplate: string;
    typingIndicatorText: string;
  };
}

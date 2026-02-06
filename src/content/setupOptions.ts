import { ToneOption, LocationOption, DateIdeaOption } from "@/lib/types";

export const tones: ToneOption[] = [
  {
    toneId: "cozy",
    label: "Cozy",
    promptKit:
      "soft warm lighting, gentle bokeh, calm ambience, sincere and tender mood",
  },
  {
    toneId: "comedy",
    label: "Comedy",
    promptKit:
      "lighthearted mood, playful energy, small amused reactions, warm casual vibe",
  },
  {
    toneId: "romantic",
    label: "Romantic",
    promptKit:
      "romantic tension, intimate framing, soft glow, lingering eye contact, tender mood",
  },
  {
    toneId: "dramatic",
    label: "Dramatic",
    promptKit:
      "subtle tension, moody lighting, thoughtful pauses, emotionally charged atmosphere",
  },
];

export const locations: LocationOption[] = [
  {
    locationId: "neon_cafe",
    label: "Rainy Neon Cafe",
    worldBiblePrompt:
      "Indoor cafe at night. Dark wood table at bottom of frame with two coffee cups. Character sits behind the table. Background: cafe interior with warm Edison bulb lighting, rain-streaked window showing neon signs outside (pink, purple, blue glow). Cozy warm atmosphere, shallow depth of field.",
  },
  {
    locationId: "rooftop_overlook",
    label: "Rooftop Overlook",
    worldBiblePrompt:
      "Outdoor rooftop terrace at night. Small table at bottom of frame with two wine glasses. Character sits behind the table. Background: string lights above, city skyline with glowing buildings, night sky. Warm ambient lighting from string lights, romantic atmosphere.",
  },
];

export const dateIdeas: DateIdeaOption[] = [
  {
    dateIdeaId: "coffee_talk",
    label: "Coffee & Conversation",
    promptKit:
      "small table, warm mugs, quiet conversation vibe, intimate but respectful distance",
  },
  {
    dateIdeaId: "night_walk",
    label: "Short Night Walk",
    promptKit:
      "preparing to leave, moving toward the door, neon reflections outside, gentle motion but stable camera",
  },
];

// Helper to get by ID
export const getTone = (id: string) => tones.find((t) => t.toneId === id);
export const getLocation = (id: string) => locations.find((l) => l.locationId === id);
export const getDateIdea = (id: string) => dateIdeas.find((d) => d.dateIdeaId === id);

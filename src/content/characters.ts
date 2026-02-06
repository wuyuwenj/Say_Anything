import { DateCharacter, Character } from "@/lib/types";

// Demo date characters with diverse options
export const dateCharacters: Record<string, DateCharacter> = {
  mina: {
    characterId: "mina",
    displayName: "Mina",
    gender: "female",
    appearancePrompt:
      "East Asian woman, age 25. FACE: oval face shape, high cheekbones, monolid dark brown eyes with subtle eyeliner, small nose with soft bridge, full natural lips with light pink tint, clear skin with natural glow. HAIR: jet black straight hair in chin-length bob with side-swept bangs covering forehead. OUTFIT: black leather jacket over burgundy turtleneck. EXPRESSION: thoughtful half-smile, slightly raised eyebrow, intelligent gaze. Photorealistic, beautiful.",
    personalityTags: [
      "witty",
      "guarded",
      "values honesty",
      "teases when comfortable",
      "dislikes bragging",
    ],
    ui: {
      avatarKey: "mina_default",
      nameplate: "Mina",
      typingIndicatorText: "Mina is thinking...",
    },
  },
  kai: {
    characterId: "kai",
    displayName: "Kai",
    gender: "male",
    appearancePrompt:
      "Black man, age 26. FACE: strong jawline, warm dark brown eyes with long lashes, broad nose, full lips, smooth dark brown skin, high forehead. HAIR: short black hair with tapered fade on sides, neat and textured on top. OUTFIT: navy blue crewneck sweater over white collar shirt. EXPRESSION: genuine warm smile showing teeth, kind eyes, relaxed and open demeanor. Photorealistic, handsome.",
    personalityTags: [
      "warm",
      "genuine",
      "good listener",
      "thoughtful",
      "quietly confident",
    ],
    ui: {
      avatarKey: "kai_default",
      nameplate: "Kai",
      typingIndicatorText: "Kai is thinking...",
    },
  },
  luna: {
    characterId: "luna",
    displayName: "Luna",
    gender: "female",
    appearancePrompt:
      "White woman, age 23. FACE: heart-shaped face, light freckles across nose and cheeks, large hazel-green eyes, small upturned nose, rosy pink lips, fair porcelain skin with pink undertones. HAIR: long wavy copper-red auburn hair past shoulders, natural loose waves, center part. OUTFIT: oversized cream cable-knit sweater with loose neckline. EXPRESSION: soft dreamy smile, gentle curious gaze, head slightly tilted. Photorealistic, naturally beautiful.",
    personalityTags: [
      "creative",
      "dreamy",
      "empathetic",
      "playful",
      "loves deep conversations",
    ],
    ui: {
      avatarKey: "luna_default",
      nameplate: "Luna",
      typingIndicatorText: "Luna is thinking...",
    },
  },
  alex: {
    characterId: "alex",
    displayName: "Alex",
    gender: "male",
    appearancePrompt:
      "Mediterranean man, age 28. FACE: square jaw with light stubble, deep-set grey-green eyes under thick dark eyebrows, straight Roman nose, defined cheekbones, olive tan skin. HAIR: dark brown wavy hair swept back casually, medium length on top. OUTFIT: charcoal grey henley shirt unbuttoned at collar, sleeves pushed to forearms. EXPRESSION: confident smirk, one eyebrow slightly raised, intense but warm eye contact. Photorealistic, classically handsome.",
    personalityTags: [
      "charming",
      "adventurous",
      "witty",
      "protective",
      "secretly romantic",
    ],
    ui: {
      avatarKey: "alex_default",
      nameplate: "Alex",
      typingIndicatorText: "Alex is thinking...",
    },
  },
  river: {
    characterId: "river",
    displayName: "River",
    gender: "non-binary",
    appearancePrompt:
      "Androgynous person, age 24. FACE: soft angular features, almond-shaped amber-brown eyes with gold flecks, straight nose, full lips, warm beige skin with subtle golden undertone, light beauty mark below left eye. HAIR: short tousled dark brown hair with bleached blonde highlights, longer on top and swept to one side, undercut on sides. OUTFIT: oversized sage green linen shirt with rolled sleeves, silver chain necklace, small hoop earrings. EXPRESSION: playful curious smile, one corner of mouth lifted, attentive engaged gaze. Photorealistic, striking and beautiful.",
    personalityTags: [
      "curious",
      "open-minded",
      "artistic",
      "easy-going",
      "surprisingly deep",
    ],
    ui: {
      avatarKey: "river_default",
      nameplate: "River",
      typingIndicatorText: "River is thinking...",
    },
  },
};

// Default player character appearance prompts by gender
export const defaultPlayerAppearance: Record<string, string> = {
  male: "A young man in his mid-20s with a friendly, approachable appearance. Casually dressed, realistic human proportions.",
  female: "A young woman in her mid-20s with a friendly, approachable appearance. Casually dressed, realistic human proportions.",
  "non-binary": "A young person in their mid-20s with an androgynous, friendly appearance. Casually dressed, realistic human proportions.",
};

// Helper to get date character by ID
export const getDateCharacter = (id: string): DateCharacter | undefined =>
  dateCharacters[id];

// Get all date characters as array
export const getAllDateCharacters = (): DateCharacter[] =>
  Object.values(dateCharacters);

// Legacy support
export const characters: Record<string, Character> = {
  mina: {
    characterId: "mina",
    displayName: "Mina",
    role: "date",
    genderPresentation: "female",
    appearancePrompt: dateCharacters.mina.appearancePrompt,
    personalityTags: dateCharacters.mina.personalityTags,
    ui: dateCharacters.mina.ui,
  },
};

export const getCharacter = (id: string) => characters[id] || dateCharacters[id];

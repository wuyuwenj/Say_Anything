import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Lazily initialize OpenAI client to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

interface EvaluateRequest {
  userMessage: string;
  characterName: string;
  characterGender: string;
  characterPersonality: string;
  currentMood: string;
  conversationContext: string;
  location: string;
}

interface EvaluateResponse {
  meterDelta: {
    trust: number;
    chemistry: number;
    affection: number;
  };
  npcDialogue: string;
  odysseyPrompt: string;
  isAppropriate: boolean;
}

const SYSTEM_PROMPT = `You are an AI that evaluates dating conversation inputs and generates responses for a dating simulation game.

Your job is to:
1. Evaluate how the user's message/action would affect the date's feelings
2. Generate a natural dialogue response from the date character
3. Generate a visual description for an AI video model to render

IMPORTANT RULES:
- Meter changes should be between -3 and +3 for each stat
- Trust: affected by honesty, respect, vulnerability, reliability
- Chemistry: affected by humor, flirting, playfulness, wit
- Affection: affected by romantic gestures, compliments, thoughtfulness, intimacy
- If the message is inappropriate, rude, or creepy, give negative scores and an awkward reaction
- If the message includes an ACTION (like giving flowers, ordering drinks), describe it visually in the odysseyPrompt
- The odysseyPrompt should describe what the CHARACTER does/looks like, not the player (first-person view)
- Keep npcDialogue natural and in-character
- odysseyPrompt should be concise but descriptive for video generation

CRITICAL FOR SCENE CONTINUITY:
- The scene already has drinks/glasses on the table - ALWAYS mention "drinks still on table" or "glasses remain" when adding new objects
- When new objects appear (flowers, gifts), describe them being ADDED to the existing scene, not replacing it
- Example: "Character reaches for flowers now on the table beside the drinks, smiles warmly" NOT "Character holds flowers"
- Transitions should feel natural - objects appear gradually, not instantaneously
- Always maintain: table, existing drinks, same framing

Respond ONLY with valid JSON in this exact format:
{
  "meterDelta": { "trust": <-3 to 3>, "chemistry": <-3 to 3>, "affection": <-3 to 3> },
  "npcDialogue": "<what the character says in response>",
  "odysseyPrompt": "<visual description of character's reaction - MUST preserve existing scene elements like drinks>",
  "isAppropriate": <true/false>
}`;

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body: EvaluateRequest = await request.json();

    const {
      userMessage,
      characterName,
      characterGender,
      characterPersonality,
      currentMood,
      conversationContext,
      location,
    } = body;

    const userPrompt = `Character info:
- Name: ${characterName}
- Gender: ${characterGender}
- Personality: ${characterPersonality}
- Current mood: ${currentMood}
- Location: ${location}

CURRENT SCENE STATE:
- ${characterName} is sitting at a table facing the camera
- There are drinks/glasses on the table between us
- Same table, same setting throughout

Recent conversation:
${conversationContext}

The player says/does: "${userMessage}"

Evaluate this and generate the character's response. Remember:
- ${characterName} should respond naturally based on their personality
- If the player mentions an ACTION (giving something, ordering something), include it visually in odysseyPrompt
- The odysseyPrompt describes what ${characterName} does - first-person view, we only see ${characterName}
- CRITICAL: When adding new objects (flowers, gifts), describe them appearing ON THE TABLE BESIDE the existing drinks - never replace the drinks
- Example good odysseyPrompt: "${characterName} notices flowers appearing on the table next to the drinks, reaches toward them with a surprised smile, glasses still visible"
- Example bad odysseyPrompt: "${characterName} holds flowers" (this removes the drinks and table context)`;

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    // Parse the JSON response
    let parsedResponse: EvaluateResponse;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      parsedResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", responseText);
      // Return a default neutral response
      parsedResponse = {
        meterDelta: { trust: 0, chemistry: 0, affection: 0 },
        npcDialogue: "Hmm, I'm not sure what to say to that...",
        odysseyPrompt: "Character looks slightly confused, tilts head, uncertain expression.",
        isAppropriate: true,
      };
    }

    // Clamp meter values to valid range
    parsedResponse.meterDelta.trust = Math.max(-3, Math.min(3, parsedResponse.meterDelta.trust));
    parsedResponse.meterDelta.chemistry = Math.max(-3, Math.min(3, parsedResponse.meterDelta.chemistry));
    parsedResponse.meterDelta.affection = Math.max(-3, Math.min(3, parsedResponse.meterDelta.affection));

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("Error evaluating message:", error);
    return NextResponse.json(
      {
        meterDelta: { trust: 0, chemistry: 0, affection: 0 },
        npcDialogue: "Sorry, I got a bit distracted. What were you saying?",
        odysseyPrompt: "Character looks momentarily distracted, then refocuses with a small apologetic smile.",
        isAppropriate: true,
      },
      { status: 200 } // Return 200 with fallback to not break the game
    );
  }
}

import { Episode } from "@/lib/types";

export const episode1: Episode = {
  schemaVersion: "1.0",
  gameId: "date-sim-mvp",
  episodeId: "episode-1",
  title: "First Date: The Neon Cafe",
  meters: {
    trust: { min: -3, max: 6, start: 0 },
    chemistry: { min: -3, max: 6, start: 0 },
    affection: { min: -3, max: 6, start: 0 },
  },
  promptTemplates: {
    shotTemplates: {
      establishing_two_shot:
        "Two people sitting across from each other at a small table near a rainy window. Medium two-shot, eye-level, shallow depth of field, warm light, stable camera.",
      mina_closeup:
        "Medium close-up on Mina, shallow depth of field, soft bokeh, warm practical lights, stable camera.",
      ots_to_mina:
        "Over-the-shoulder shot from behind the unseen player toward Mina, shallow depth of field, stable camera.",
      wide_near_exit:
        "Wide shot near the cafe door with neon city visible through glass, stable camera, deep focus, gentle mood.",
    },
    globalConstraints:
      "No readable text. No logos. No watermarks. No subtitles. No UI overlays. No sudden cuts or teleporting. Do not introduce new characters unless prompted. Preserve continuity.",
  },
  outcomes: [
    {
      outcomeId: "spark",
      label: "Spark",
      condition: { chemistryAtLeast: 3, trustAtLeast: 1 },
      uiSummary:
        "You two end the night smiling. It feels like there's definitely a second date coming.",
    },
    {
      outcomeId: "steady",
      label: "Steady",
      condition: { trustAtLeast: 2 },
      uiSummary:
        "It's calm and comfortable. Not fireworks, but it feels real—and promising.",
    },
    {
      outcomeId: "awkward",
      label: "Awkward",
      condition: { trustAtMost: 0, chemistryAtMost: 0 },
      uiSummary:
        "The vibe never quite clicks. You part politely, both a little unsure.",
    },
  ],
  turns: [
    {
      turnId: "t1_meet",
      sceneId: "scene1_table",
      shotTemplateId: "establishing_two_shot",
      npcLine: {
        lineId: "npc_t1",
        text: "Okay... first impressions. Are you more 'deep talks' or 'chaos gremlin'?",
        caption: "They tilt their head, curious but guarded.",
      },
      choices: [
        {
          choiceId: "t1_a_sincere",
          playerText:
            "Probably deep talks. But I can do a little chaos, responsibly.",
          meterDelta: { trust: 1, chemistry: 0, affection: 0 },
          reactionPrompt:
            "Character looks pleasantly surprised and relaxes slightly, small warm smile. Mood: sincere, comfortable.",
        },
        {
          choiceId: "t1_b_playful",
          playerText:
            "Chaos gremlin, unfortunately. But I'm charming, so it evens out.",
          meterDelta: { trust: 0, chemistry: 1, affection: 0 },
          reactionPrompt:
            "Character is amused, a small smirk, playful energy. Mood: teasing, light chemistry.",
        },
        {
          choiceId: "t1_c_action_drink",
          playerText: "[Signal the waiter] Let me get us some drinks first.",
          meterDelta: { trust: 1, chemistry: 1, affection: 0 },
          reactionPrompt:
            "Character looks pleased as a drink appears on the table. They pick up the glass and smile appreciatively. Mood: impressed, warming up.",
        },
      ],
      next: { defaultTurnId: "t2_followup" },
    },
    {
      turnId: "t2_followup",
      sceneId: "scene1_table",
      shotTemplateId: "mina_closeup",
      npcLineVariants: [
        {
          variantId: "t2_high_chem",
          condition: { chemistryAtLeast: 1 },
          text: "Alright, chaos-with-charm is... mildly convincing. What's something you're weirdly passionate about?",
          caption: "Their eyes brighten; testing you, but smiling.",
        },
        {
          variantId: "t2_default",
          condition: {},
          text: "Okay, fair. So—what do you actually like doing when no one's watching?",
          caption: "They look attentive, waiting for a real answer.",
        },
      ],
      choices: [
        {
          choiceId: "t2_a_honest",
          playerText:
            "I love collecting tiny routines—like finding the one cafe that makes everything feel quiet for a second.",
          meterDelta: { trust: 1, chemistry: 0, affection: 1 },
          reactionPrompt:
            "Character softens, appreciative expression. Mood: warm, intimate, cozy.",
        },
        {
          choiceId: "t2_b_funny",
          playerText:
            "I rehearse imaginary arguments in the shower and somehow lose all of them.",
          meterDelta: { trust: 0, chemistry: 1, affection: 0 },
          reactionPrompt:
            "Character laughs quietly, amused and charmed. Mood: playful, relaxed.",
        },
        {
          choiceId: "t2_c_action_show_phone",
          playerText:
            "[Show them your phone] Here, let me show you this playlist I made.",
          meterDelta: { trust: 1, chemistry: 1, affection: 0 },
          reactionPrompt:
            "Character leans in closer to look at the phone screen, shoulder almost touching yours. Interested smile. Mood: intimate, sharing moment.",
        },
      ],
      next: { defaultTurnId: "t3_boundary" },
    },
    {
      turnId: "t3_boundary",
      sceneId: "scene1_table",
      shotTemplateId: "ots_to_mina",
      npcLine: {
        lineId: "npc_t3",
        text: "Can I be honest? I'm bad at small talk. It makes me feel like I'm performing.",
        caption: "They glance away, then back, choosing to trust you.",
      },
      choices: [
        {
          choiceId: "t3_a_validate",
          playerText:
            "Same. We can skip the performance. Just... be real. No pressure.",
          meterDelta: { trust: 2, chemistry: 0, affection: 1 },
          reactionPrompt:
            "Character looks relieved, shoulders relax, warm grateful smile. Mood: safe, sincere.",
        },
        {
          choiceId: "t3_b_flirt",
          playerText:
            "Good—because I'm only here for the real you. Not the first-date version.",
          meterDelta: { trust: 1, chemistry: 2, affection: 1 },
          reactionPrompt:
            "Character blushes slightly, looks down with a shy smile, then back up with warmth in their eyes. Mood: tender, romantic.",
        },
        {
          choiceId: "t3_c_pushy",
          playerText:
            "Then don't perform. Tell me the biggest trauma. Right now.",
          meterDelta: { trust: -2, chemistry: -1, affection: -1 },
          reactionPrompt:
            "Character looks uncomfortable, guarded expression returns. Mood: tense, awkward.",
        },
      ],
      next: { defaultTurnId: "t4_shift_scene" },
    },
    {
      turnId: "t4_shift_scene",
      sceneId: "scene2_transition",
      shotTemplateId: "wide_near_exit",
      npcLineVariants: [
        {
          variantId: "t4_good_vibes",
          condition: { trustAtLeast: 2 },
          text: "Do you want to keep talking outside for a minute? The view is kind of pretty.",
          caption: "They look hopeful—wanting more time with you.",
        },
        {
          variantId: "t4_default",
          condition: {},
          text: "So... what's your verdict so far? Are we surviving this date?",
          caption: "They try to play it off, but watching your reaction.",
        },
      ],
      choices: [
        {
          choiceId: "t4_a_dessert",
          playerText:
            "Wait—we should get dessert. You pick something.",
          meterDelta: { trust: 1, chemistry: 1, affection: 1 },
          reactionPrompt:
            "Character's eyes light up excitedly. They look at the menu with a big smile, clearly delighted. Mood: joyful, playful.",
        },
        {
          choiceId: "t4_b_tease",
          playerText:
            "We're surviving. But I'm going to need bonus points for emotional bravery.",
          meterDelta: { trust: 0, chemistry: 1, affection: 0 },
          reactionPrompt:
            "Character laughs, playful teasing energy. Mood: light, flirty.",
        },
        {
          choiceId: "t4_c_sincere",
          playerText:
            "Honestly? This is the best date I've had in a while.",
          meterDelta: { trust: 2, chemistry: 1, affection: 1 },
          reactionPrompt:
            "Character looks genuinely touched, soft smile, eyes warm with affection. They lean forward slightly. Mood: heartfelt, intimate.",
        },
      ],
      next: { defaultTurnId: "t5_confession" },
    },
    {
      turnId: "t5_confession",
      sceneId: "scene2_walk",
      shotTemplateId: "mina_closeup",
      npcLine: {
        lineId: "npc_t5",
        text: "I'm going to say something risky: I like you. And that annoys me a little.",
        caption: "A smile, caught between embarrassed and proud.",
      },
      choices: [
        {
          choiceId: "t5_a_romantic",
          playerText:
            "I like you too. A lot, actually. Is that weird to say?",
          meterDelta: { trust: 1, chemistry: 2, affection: 2 },
          reactionPrompt:
            "Character's face softens with genuine emotion. They smile warmly, eyes glistening slightly. Mood: romantic, tender, vulnerable.",
        },
        {
          choiceId: "t5_b_playful",
          playerText:
            "That's dangerous. We might actually have to go on a second date now.",
          meterDelta: { trust: 1, chemistry: 2, affection: 1 },
          reactionPrompt:
            "Character laughs, then leans forward with a flirty smile. Eyes sparkling with interest. Mood: playful, romantic tension.",
        },
        {
          choiceId: "t5_c_miss",
          playerText: "Cool. So what are you, like... obsessed?",
          meterDelta: { trust: -2, chemistry: -1, affection: -1 },
          reactionPrompt:
            "Character's smile fades, they look disappointed and lean back. Mood: awkward, tense.",
        },
      ],
      next: { defaultTurnId: "t6_close" },
    },
    {
      turnId: "t6_close",
      sceneId: "scene2_end",
      shotTemplateId: "establishing_two_shot",
      npcLineVariants: [
        {
          variantId: "t6_second_date",
          condition: { chemistryAtLeast: 3 },
          text: "Okay, I'm going to be bold. Second date—same time next week?",
          caption: "Looking at you directly, nervous but excited.",
        },
        {
          variantId: "t6_default",
          condition: {},
          text: "So... are we doing this again sometime? Or are we pretending we never met?",
          caption: "Trying to joke, but sincerely asking.",
        },
      ],
      choices: [
        {
          choiceId: "t6_a_romantic",
          playerText: "I really want to see you again. Soon.",
          meterDelta: { trust: 1, chemistry: 2, affection: 2 },
          reactionPrompt:
            "Character beams with joy, eyes bright and cheeks flushed. They nod eagerly, clearly happy. Mood: romantic, perfect ending.",
        },
        {
          choiceId: "t6_b_sweet",
          playerText:
            "This was honestly the best night I've had in a long time. Thank you.",
          meterDelta: { trust: 2, chemistry: 1, affection: 1 },
          reactionPrompt:
            "Character looks genuinely moved, soft smile spreading across their face. Eyes warm with affection. Mood: sweet, heartfelt.",
        },
        {
          choiceId: "t6_c_casual",
          playerText:
            "This was fun! Let's do it again sometime.",
          meterDelta: { trust: 1, chemistry: 0, affection: 0 },
          reactionPrompt:
            "Character smiles warmly and nods. A friendly, hopeful expression. Mood: positive, open ending.",
        },
      ],
      endEpisode: true,
    },
  ],
  devTools: {
    driftResetPrompt:
      "Return to the original setup: same location, same two people, same outfits, cinematic realism, stable camera, warm practical lights (or rooftop neon glow if rooftop). Remove any extra characters, strange artifacts, or text. No cuts.",
    notes: [
      "UI dialogue should be rendered by your app, not the video model.",
      "Use reactionPrompt snippets as part of your prompt builder after each choice.",
      "npcLineVariants allow lightweight branching without needing another AI layer.",
    ],
  },
};

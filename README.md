# Say Anything

A dating sim where you can say anything — powered by real-time AI video generation.

## What Makes It Unique

Unlike traditional dating sims with fixed dialogue options, **Say Anything** lets you type whatever you want. Your custom responses are evaluated by AI and rendered as real-time video reactions using [Odyssey's](https://odyssey.ml) world model.

Want to give your date flowers? Just type "I got you some flowers" and watch them react in real-time video.

## Features

- **5 Preset Characters** - Mina, Kai, Luna, Alex, and River (each with unique personalities and appearances)
- **Custom Character Creation** - Create your own date character
- **Real-time AI Video** - Powered by Odyssey's world model for live video generation
- **Say Anything** - Type custom responses that get evaluated by OpenAI and rendered visually
- **Action Support** - Actions like giving flowers, ordering drinks, etc. are rendered in the video
- **Relationship Meters** - Trust, Chemistry, and Affection tracked throughout the date
- **Multiple Locations** - Cozy cafe or rooftop overlook
- **4 Mood Tones** - Cozy, Comedy, Romantic, or Dramatic
- **Hide UI Toggle** - Press H to hide the UI and watch reactions unobstructed

## Tech Stack

- **Next.js 16** - React framework
- **Odyssey SDK** - Real-time AI video generation
- **OpenAI API** - Custom response evaluation (gpt-4o-mini)
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Getting Started

### Prerequisites

- Node.js 18+
- Odyssey API key ([get one here](https://odyssey.ml))
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/wuyuwenj/Say_Anything.git
   cd Say_Anything
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your API keys to `.env`:
   ```
   NEXT_PUBLIC_ODYSSEY_API_KEY=ody_your_api_key_here
   OPENAI_API_KEY=sk-your_api_key_here
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

1. **Setup** - Choose your character, select a date partner, pick a location and mood
2. **Date** - Watch the AI-generated video of your date and respond to their dialogue
3. **Choose or Type** - Select from preset options OR click "Say something else..." to type anything
4. **Watch Reactions** - Your date reacts in real-time video based on what you say
5. **Build Connection** - Your responses affect Trust, Chemistry, and Affection meters
6. **See Results** - At the end, see how your date went based on your choices

### Keyboard Shortcuts

- `1` `2` `3` - Select dialogue options
- `H` - Hide/show the conversation UI

## Project Structure

```
src/
├── app/
│   ├── api/evaluate/    # OpenAI evaluation endpoint
│   ├── play/            # Main game page
│   ├── setup/           # Character & scene setup
│   └── results/         # End-of-date results
├── components/
│   ├── game/            # VideoPanel (Odyssey integration)
│   └── ui/              # Reusable UI components
├── content/
│   ├── characters.ts    # Character definitions
│   ├── episode1.ts      # Dialogue and choices
│   └── setupOptions.ts  # Locations and tones
└── lib/
    ├── promptBuilder.ts # Odyssey prompt generation
    ├── types.ts         # TypeScript types
    └── useGameEngine.ts # Game state management
```

## License

MIT

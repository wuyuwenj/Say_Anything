"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locations, tones } from "@/content/setupOptions";
import { getAllDateCharacters } from "@/content/characters";
import { Gender, DateCharacterId } from "@/lib/types";

export default function SetupPage() {
  const router = useRouter();

  // Scene settings
  const [location, setLocation] = useState("");
  const [tone, setTone] = useState("");

  // Date character
  const [dateCharacterId, setDateCharacterId] = useState<DateCharacterId | "custom" | "">("");
  const [customDateName, setCustomDateName] = useState("");
  const [customDateGender, setCustomDateGender] = useState<Gender | "">("");
  const [customDateAppearance, setCustomDateAppearance] = useState("");

  const dateCharacters = getAllDateCharacters();
  const selectedDateChar = dateCharacters.find((c) => c.characterId === dateCharacterId);
  const isCustomDate = dateCharacterId === "custom";

  const canStart =
    location &&
    tone &&
    dateCharacterId &&
    (isCustomDate ? customDateName && customDateGender && customDateAppearance : true);

  const handleStart = () => {
    // Build date character info
    let dateInfo: {
      id: string;
      name: string;
      gender: Gender;
      appearance: string;
      imageUrl?: string;
    };

    if (isCustomDate) {
      dateInfo = {
        id: "custom",
        name: customDateName,
        gender: customDateGender as Gender,
        appearance: customDateAppearance,
      };
    } else {
      const char = selectedDateChar!;
      dateInfo = {
        id: char.characterId,
        name: char.displayName,
        gender: char.gender,
        appearance: char.appearancePrompt,
      };
    }

    // Store date character data in sessionStorage for the play page
    sessionStorage.setItem("dateCharacter", JSON.stringify(dateInfo));

    const params = new URLSearchParams({
      location,
      tone,
      dateCharacterId: dateInfo.id,
    });
    router.push(`/play?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Set the Scene</h1>
          <p className="text-slate-400">Choose your date and how your evening will unfold</p>
        </div>

        {/* Date Character Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Your Date</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Choose a Character</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {dateCharacters.map((char) => (
                  <Button
                    key={char.characterId}
                    variant={dateCharacterId === char.characterId ? "default" : "outline"}
                    className={`h-auto py-3 flex-col ${
                      dateCharacterId === char.characterId
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    }`}
                    onClick={() => setDateCharacterId(char.characterId as DateCharacterId)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-2">
                      <span className="text-lg font-bold">{char.displayName[0]}</span>
                    </div>
                    <span className="font-medium">{char.displayName}</span>
                    <span className="text-xs opacity-70 capitalize">{char.gender}</span>
                  </Button>
                ))}
                <Button
                  variant={dateCharacterId === "custom" ? "default" : "outline"}
                  className={`h-auto py-3 flex-col ${
                    dateCharacterId === "custom"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  }`}
                  onClick={() => setDateCharacterId("custom")}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center mb-2">
                    <span className="text-lg">+</span>
                  </div>
                  <span className="font-medium">Custom</span>
                  <span className="text-xs opacity-70">Create your own</span>
                </Button>
              </div>
            </div>

            {/* Selected character preview */}
            {selectedDateChar && !isCustomDate && (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold">{selectedDateChar.displayName[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{selectedDateChar.displayName}</h4>
                    <p className="text-sm text-slate-400 capitalize mb-2">{selectedDateChar.gender}</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedDateChar.personalityTags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-slate-600 px-2 py-0.5 rounded text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom character form */}
            {isCustomDate && (
              <div className="bg-slate-700/50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Name</label>
                    <input
                      type="text"
                      value={customDateName}
                      onChange={(e) => setCustomDateName(e.target.value)}
                      placeholder="Character name..."
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Gender</label>
                    <Select value={customDateGender} onValueChange={(v) => setCustomDateGender(v as Gender)}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select gender..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="male" className="text-white focus:bg-slate-700">Male</SelectItem>
                        <SelectItem value="female" className="text-white focus:bg-slate-700">Female</SelectItem>
                        <SelectItem value="non-binary" className="text-white focus:bg-slate-700">Non-binary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Appearance Description</label>
                  <textarea
                    value={customDateAppearance}
                    onChange={(e) => setCustomDateAppearance(e.target.value)}
                    placeholder="Describe their appearance in detail (hair, clothing, features)..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-500 min-h-[80px]"
                  />
                </div>

              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Selection */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Choose a location..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {locations.map((loc) => (
                  <SelectItem
                    key={loc.locationId}
                    value={loc.locationId}
                    className="text-white focus:bg-slate-700"
                  >
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Tone Selection */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Tone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {tones.map((t) => (
                <Button
                  key={t.toneId}
                  variant={tone === t.toneId ? "default" : "outline"}
                  className={`h-auto py-3 ${
                    tone === t.toneId
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  }`}
                  onClick={() => setTone(t.toneId)}
                >
                  <div className="text-left">
                    <div className="font-medium">{t.label}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Button
          onClick={handleStart}
          disabled={!canStart}
          className="w-full py-6 text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Begin Date
        </Button>
      </div>
    </main>
  );
}

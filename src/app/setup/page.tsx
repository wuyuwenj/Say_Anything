"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { locations, tones } from "@/content/setupOptions";
import { getAllDateCharacters } from "@/content/characters";
import { Gender, DateCharacterId } from "@/lib/types";

const characterIcons: Record<string, string> = {
  mina: "solar:user-heart-linear",
  kai: "solar:user-linear",
  luna: "solar:stars-minimalistic-linear",
  alex: "solar:glasses-linear",
  river: "solar:music-note-linear",
  custom: "solar:add-circle-linear",
};

const characterColors: Record<string, { bg: string; text: string; hover: string; border: string }> = {
  mina: { bg: "bg-rose-100", text: "text-rose-500", hover: "hover:border-rose-300 hover:bg-rose-50", border: "border-rose-200" },
  kai: { bg: "bg-sky-100", text: "text-sky-500", hover: "hover:border-sky-300 hover:bg-sky-50", border: "border-sky-200" },
  luna: { bg: "bg-purple-100", text: "text-purple-500", hover: "hover:border-purple-300 hover:bg-purple-50", border: "border-purple-200" },
  alex: { bg: "bg-emerald-100", text: "text-emerald-500", hover: "hover:border-emerald-300 hover:bg-emerald-50", border: "border-emerald-200" },
  river: { bg: "bg-amber-100", text: "text-amber-500", hover: "hover:border-amber-300 hover:bg-amber-50", border: "border-amber-200" },
  custom: { bg: "bg-gray-100", text: "text-gray-500", hover: "hover:border-gray-500 hover:bg-gray-50", border: "border-gray-300" },
};

const toneIcons: Record<string, string> = {
  cozy: "solar:cup-hot-linear",
  comedy: "solar:emoji-funny-circle-linear",
  romantic: "solar:heart-linear",
  dramatic: "solar:mask-happly-linear",
};

const toneColors: Record<string, { hover: string; active: string }> = {
  cozy: { hover: "hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700", active: "border-amber-400 bg-amber-100 text-amber-700" },
  comedy: { hover: "hover:border-pink-300 hover:bg-pink-50 hover:text-pink-700", active: "border-pink-400 bg-pink-100 text-pink-700" },
  romantic: { hover: "hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700", active: "border-rose-400 bg-rose-100 text-rose-700" },
  dramatic: { hover: "hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700", active: "border-purple-400 bg-purple-100 text-purple-700" },
};

export default function SetupPage() {
  const router = useRouter();

  const [location, setLocation] = useState("");
  const [tone, setTone] = useState("");
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
    let dateInfo: {
      id: string;
      name: string;
      gender: Gender;
      appearance: string;
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

    sessionStorage.setItem("dateCharacter", JSON.stringify(dateInfo));

    const params = new URLSearchParams({
      location,
      tone,
      dateCharacterId: dateInfo.id,
    });
    router.push(`/play?${params.toString()}`);
  };

  return (
    <>
      <style jsx global>{`
        .setup-page {
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
          box-shadow: 0 4px 0 rgba(0,0,0,0.1);
        }
        .pop-shadow:active:not(:disabled) {
          box-shadow: 0 0 0 rgba(0,0,0,0.1);
          transform: translateY(4px);
        }
      `}</style>

      <div className="setup-page min-h-screen flex items-center justify-center p-4 selection:bg-[#98FF98] selection:text-gray-700">
        {/* Background Decor */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <iconify-icon icon="solar:settings-minimalistic-linear" className="absolute top-10 right-10 text-white/40 text-6xl" style={{ animation: "spin 10s linear infinite" }}></iconify-icon>
          <iconify-icon icon="solar:cup-hot-linear" className="absolute bottom-20 left-20 text-white/50 text-8xl" style={{ transform: "rotate(15deg)" }}></iconify-icon>
        </div>

        <main className="relative z-10 w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] border-[6px] border-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

          {/* Header */}
          <header className="p-6 md:p-8 pb-2 text-center border-b border-gray-100 bg-white/50">
            <h1 className="bubbly-font text-3xl md:text-4xl font-bold text-[#FF6B6B] tracking-tight mb-2 flex items-center justify-center gap-3">
              <iconify-icon icon="solar:clapperboard-edit-linear" className="text-2xl md:text-3xl"></iconify-icon>
              Set the Scene
            </h1>
            <p className="text-gray-500 font-medium text-sm md:text-base">Choose your date and how your evening will unfold</p>
          </header>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-6 md:p-8 space-y-8">

            {/* Section 1: Your Date */}
            <section className="space-y-4">
              <h2 className="bubbly-font text-xl font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-sm">1</span>
                Your Date
              </h2>

              <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider pl-1">Choose a Character</label>

              {/* Character Selection Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {dateCharacters.map((char) => {
                  const colors = characterColors[char.characterId] || characterColors.custom;
                  const isSelected = dateCharacterId === char.characterId;
                  return (
                    <button
                      key={char.characterId}
                      onClick={() => setDateCharacterId(char.characterId as DateCharacterId)}
                      className={`group relative p-3 rounded-2xl border-2 transition-all text-left flex flex-col items-center gap-2 bg-white ${
                        isSelected
                          ? `border-rose-400 bg-rose-50 ring-2 ring-rose-200`
                          : `border-gray-100 ${colors.hover}`
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-2xl border-2 border-white shadow-sm group-hover:scale-110 transition-transform`}>
                        <iconify-icon icon={characterIcons[char.characterId] || "solar:user-linear"}></iconify-icon>
                      </div>
                      <div className="text-center">
                        <span className="bubbly-font block font-bold text-gray-700 text-sm">{char.displayName}</span>
                        <span className="block text-xs text-gray-400 font-medium">{char.gender}</span>
                      </div>
                    </button>
                  );
                })}

                {/* Custom */}
                <button
                  onClick={() => setDateCharacterId("custom")}
                  className={`group relative p-3 rounded-2xl border-2 border-dashed transition-all text-left flex flex-col items-center gap-2 bg-white/50 ${
                    isCustomDate
                      ? `border-gray-500 bg-gray-100 ring-2 ring-gray-300`
                      : `border-gray-300 hover:border-gray-500 hover:bg-gray-50`
                  }`}
                >
                  <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-2xl border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                    <iconify-icon icon="solar:add-circle-linear"></iconify-icon>
                  </div>
                  <div className="text-center">
                    <span className="bubbly-font block font-bold text-gray-700 text-sm">Custom</span>
                    <span className="block text-xs text-gray-400 font-medium">Create your own</span>
                  </div>
                </button>
              </div>

              {/* Selected Character Preview */}
              {selectedDateChar && !isCustomDate && (
                <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full bg-white border-4 ${characterColors[selectedDateChar.characterId]?.border || "border-rose-200"} shadow-md flex items-center justify-center text-3xl ${characterColors[selectedDateChar.characterId]?.text || "text-rose-500"}`}>
                    <iconify-icon icon={characterIcons[selectedDateChar.characterId] || "solar:user-linear"}></iconify-icon>
                  </div>
                  <div className="flex-1">
                    <h4 className="bubbly-font text-lg font-bold text-gray-800">{selectedDateChar.displayName}</h4>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{selectedDateChar.gender}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedDateChar.personalityTags.slice(0, 3).map((tag) => (
                        <span key={tag} className="bubbly-font bg-white text-gray-600 px-2 py-0.5 rounded-md text-xs font-medium border border-rose-100 shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Character Form */}
              {isCustomDate && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 ml-1">Name</label>
                      <input
                        type="text"
                        value={customDateName}
                        onChange={(e) => setCustomDateName(e.target.value)}
                        placeholder="Name..."
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] transition-shadow"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 ml-1">Gender</label>
                      <div className="relative">
                        <select
                          value={customDateGender}
                          onChange={(e) => setCustomDateGender(e.target.value as Gender)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#87CEEB] transition-shadow"
                        >
                          <option value="">Select...</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="non-binary">Non-binary</option>
                        </select>
                        <iconify-icon icon="solar:alt-arrow-down-linear" className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"></iconify-icon>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">Appearance Description</label>
                    <textarea
                      value={customDateAppearance}
                      onChange={(e) => setCustomDateAppearance(e.target.value)}
                      rows={2}
                      placeholder="Describe their appearance (e.g. 'Short blue hair, wearing a vintage jacket')..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] transition-shadow resize-none"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Section 2: Location */}
            <section className="space-y-3 pt-2 border-t border-dashed border-gray-200">
              <h2 className="bubbly-font text-xl font-semibold text-gray-700 flex items-center gap-2 mt-4">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center text-sm">2</span>
                Location
              </h2>

              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <iconify-icon icon="solar:map-point-linear" className="text-indigo-400 text-lg"></iconify-icon>
                </div>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border-2 border-gray-100 hover:border-indigo-200 rounded-xl py-3 pl-10 pr-10 text-sm font-medium text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all cursor-pointer"
                >
                  <option value="">Choose a location...</option>
                  {locations.map((loc) => (
                    <option key={loc.locationId} value={loc.locationId}>
                      {loc.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <iconify-icon icon="solar:alt-arrow-down-linear" className="text-gray-400"></iconify-icon>
                </div>
              </div>
            </section>

            {/* Section 3: Tone */}
            <section className="space-y-3 pt-2 border-t border-dashed border-gray-200">
              <h2 className="bubbly-font text-xl font-semibold text-gray-700 flex items-center gap-2 mt-4">
                <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center text-sm">3</span>
                Tone
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {tones.map((t) => {
                  const colors = toneColors[t.toneId] || toneColors.cozy;
                  const isSelected = tone === t.toneId;
                  return (
                    <button
                      key={t.toneId}
                      onClick={() => setTone(t.toneId)}
                      className={`bubbly-font px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? colors.active
                          : `border-gray-100 bg-white text-gray-600 ${colors.hover}`
                      }`}
                    >
                      <iconify-icon icon={toneIcons[t.toneId] || "solar:cup-hot-linear"}></iconify-icon>
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Footer / Start Action */}
          <footer className="p-6 bg-white/80 border-t border-gray-100 backdrop-blur-md">
            <button
              onClick={handleStart}
              disabled={!canStart}
              className={`bubbly-font w-full px-6 py-4 rounded-2xl font-bold text-lg tracking-wide transition-all pop-shadow flex items-center justify-center gap-2 ${
                canStart
                  ? "bg-[#FF6B6B] text-white hover:bg-[#ff5252] cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span>Begin Date</span>
              <iconify-icon icon="solar:arrow-right-linear" className="text-xl"></iconify-icon>
            </button>
          </footer>

        </main>
      </div>
    </>
  );
}

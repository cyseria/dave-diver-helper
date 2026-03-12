import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerProgressState {
  storyProgress: number;
  weaponLevel: number;
  capturedFishIds: string[];
  recipeEnhanceLevels: Record<string, number>;
  hiredStaffIds: string[];
  ownedWeaponIds: string[];
  fishStarRatings: Record<string, number>;
  completedQuestIds: string[];
  toggleFishCaptured: (id: string) => void;
  setRecipeEnhanceLevel: (id: string, level: number) => void;
  toggleStaffHired: (id: string) => void;
  toggleWeaponOwned: (id: string) => void;
  toggleQuestCompleted: (id: string) => void;
  setStoryProgress: (value: number) => void;
  setWeaponLevel: (value: number) => void;
  setFishStarRating: (id: string, stars: number) => void;
}

export const usePlayerProgress = create<PlayerProgressState>()(
  persist(
    (set, get) => ({
      storyProgress: 0,
      weaponLevel: 0,
      capturedFishIds: [],
      recipeEnhanceLevels: {},
      hiredStaffIds: [],
      ownedWeaponIds: [],
      fishStarRatings: {},
      completedQuestIds: [],
      toggleFishCaptured: (id) => {
        const { capturedFishIds } = get();
        set({
          capturedFishIds: capturedFishIds.includes(id)
            ? capturedFishIds.filter((f) => f !== id)
            : [...capturedFishIds, id],
        });
      },
      setRecipeEnhanceLevel: (id, level) => {
        const { recipeEnhanceLevels } = get();
        set({ recipeEnhanceLevels: { ...recipeEnhanceLevels, [id]: level } });
      },
      toggleStaffHired: (id) => {
        const { hiredStaffIds } = get();
        set({
          hiredStaffIds: hiredStaffIds.includes(id)
            ? hiredStaffIds.filter((s) => s !== id)
            : [...hiredStaffIds, id],
        });
      },
      toggleWeaponOwned: (id) => {
        const { ownedWeaponIds } = get();
        set({
          ownedWeaponIds: ownedWeaponIds.includes(id)
            ? ownedWeaponIds.filter((w) => w !== id)
            : [...ownedWeaponIds, id],
        });
      },
      toggleQuestCompleted: (id) => {
        const { completedQuestIds } = get();
        set({
          completedQuestIds: completedQuestIds.includes(id)
            ? completedQuestIds.filter((q) => q !== id)
            : [...completedQuestIds, id],
        });
      },
      setStoryProgress: (value) => set({ storyProgress: value }),
      setWeaponLevel: (value) => set({ weaponLevel: value }),
      setFishStarRating: (id, stars) => {
        const { fishStarRatings } = get();
        set({ fishStarRatings: { ...fishStarRatings, [id]: stars } });
      },
    }),
    { name: "dave-helper-progress" },
  ),
);

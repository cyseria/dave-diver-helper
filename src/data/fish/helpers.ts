import type { Fish } from "../types";

export type FishInput = Omit<Fish, "emoji" | "image" | "stars" | "recipeIds"> &
  Partial<Pick<Fish, "emoji" | "image" | "stars" | "recipeIds">>;

export const fish = (data: FishInput): Fish => {
  const emoji = data.emoji ?? "🐟";
  return {
    emoji,
    stars: 1,
    recipeIds: [],
    ...data,
    image: data.image ?? emoji,
  };
};

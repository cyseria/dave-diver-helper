import type { Fish } from "../types";

export type FishInput = Omit<Fish, "image" | "stars" | "recipeIds"> &
  Partial<Pick<Fish, "image" | "stars" | "recipeIds">>;

export const fish = (data: FishInput): Fish => {
  return {
    stars: 1,
    recipeIds: [],
    ...data,
    image: data.image ?? "",
  };
};

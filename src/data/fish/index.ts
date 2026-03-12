import type { Fish } from "../types";
import { shallowFish } from "./shallow";
import { midFish } from "./mid";
import { depthsFish } from "./depths";
import { nightOnlyFish } from "./nightOnly";
import { glacialPassageFish } from "./glacialPassage";
import { glacialZoneFish } from "./glacialZone";
import { hydrothermalVentsFish } from "./hydrothermalVents";
import { seahorsesFish } from "./seahorses";
import { trapFish } from "./trap";

export const fishData: Fish[] = [
  ...shallowFish,
  ...midFish,
  ...depthsFish,
  ...nightOnlyFish,
  ...glacialPassageFish,
  ...glacialZoneFish,
  ...hydrothermalVentsFish,
  ...seahorsesFish,
  ...trapFish
];

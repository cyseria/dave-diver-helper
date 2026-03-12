import type { Fish } from "../types";
import { shallowFish } from "./shallow";
import { midFish } from "./mid";
import { depthsFish } from "./depths";
import { glacialPassageFish } from "./glacialPassage";
import { glacialZoneFish } from "./glacialZone";
import { hydrothermalVentsFish } from "./hydrothermalVents";
import { seahorsesFish } from "./seahorses";
import { trapFish } from "./trap";
import { legacyFish } from "./legacy";

export const fishData: Fish[] = [
  ...shallowFish,
  ...midFish,
  ...depthsFish,
  ...glacialPassageFish,
  ...glacialZoneFish,
  ...hydrothermalVentsFish,
  ...seahorsesFish,
  ...trapFish,
  ...legacyFish,
];

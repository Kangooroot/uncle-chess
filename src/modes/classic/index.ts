import { classicRules, createChessMode } from "../../chess";

export const classic = createChessMode(
  { id: "classic", name: "Classic chess", description: "The standard rules of chess." },
  classicRules,
);

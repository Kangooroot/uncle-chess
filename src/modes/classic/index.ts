import { classicRules, createChessMode } from "../../chess";

export const classic = createChessMode(
  { id: "classic", name: "Échecs classiques", description: "Les règles standard des échecs." },
  classicRules,
);

// Tourcoing pawns: an arrow shows which way each pawn moves, and rare pawns
// glow gold.

import type { CSSProperties } from "react";
import { defaultPieces } from "react-chessboard";
import type { Dir } from "../../core";
import type { ModeUI } from "../ui";
import { RARE_PAWN } from ".";

const ANGLES: Record<Dir, number> = { n: 0, ne: 45, e: 90, se: 135, s: 180, sw: 225, w: 270, nw: 315 };
const GOLD = "#f2b705";
const LAYER: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };

export const tourcoingUI: ModeUI = {
  renderPiece(piece, flipped) {
    if (!piece.dir || (piece.kind !== "p" && piece.kind !== RARE_PAWN)) return null;
    const rare = piece.kind === RARE_PAWN;
    const Pawn = defaultPieces[`${piece.color}P`];
    const angle = ANGLES[piece.dir] + (flipped ? 180 : 0);
    const white = piece.color === "w";
    return (
      <div style={{ position: "relative", width: "100%", aspectRatio: "1" }}>
        {rare && (
          <svg viewBox="0 0 100 100" style={{ ...LAYER, filter: "blur(4px)" }}>
            <circle cx="50" cy="55" r="34" fill={GOLD}>
              <animate attributeName="opacity" values="0.35;0.9;0.35" dur="2.4s" repeatCount="indefinite" />
            </circle>
          </svg>
        )}
        <div style={LAYER}>
          <Pawn />
        </div>
        <svg viewBox="0 0 100 100" style={{ ...LAYER, transform: `rotate(${angle}deg)` }}>
          <polygon
            points="50,3 61,15 39,15"
            fill={rare ? GOLD : white ? "#fff" : "#000"}
            stroke={white || rare ? "#000" : "#fff"}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  },
};

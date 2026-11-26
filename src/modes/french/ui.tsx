// French chess board: the 256 hexagons of the four interleaved boards, drawn
// in SVG. Colours, move hints and dimming in specs/modes/french.md (section 8).

import { useId, useState } from "react";
import { defaultPieces } from "react-chessboard";
import type { Color, ViewPiece } from "../../core";
import type { BoardProps, ModeUI } from "../ui";
import { BOARDS, boardOf, CELLS, squareOf, toCell, toCellIndex, type BoardId } from "./board";
import type { FrenchView } from ".";
import { hexCenter, hexPoints, R, WORLD } from "./layout";

/** Light and dark shade of each board (spec, section 1.1). */
const PALETTE: Record<BoardId, { light: string; dark: string; name: string }> = {
  red: { light: "#f3c1b6", dark: "#c0452f", name: "rouge" },
  blue: { light: "#bcd6f1", dark: "#2f6aae", name: "bleu" },
  green: { light: "#c4e2b8", dark: "#3d8648", name: "vert" },
  yellow: { light: "#f5e3a3", dark: "#c4951a", name: "jaune" },
};

/** a1 is dark on every board, as on a classic chessboard. */
const isDark = (cell: number) => ((squareOf(cell) & 7) + (squareOf(cell) >> 3)) % 2 === 0;

const fill = (cell: number) => {
  const colours = PALETTE[BOARDS[boardOf(cell)]];
  return isDark(cell) ? colours.dark : colours.light;
};

const ALL_CELLS = Array.from({ length: CELLS }, (_, cell) => cell);
const PIECE_SIZE = 1.5 * R;

type Highlights = {
  selected: number | null;
  classic: number[]; // classic destinations of the selected piece
  hex: number[]; // hexagonal destinations
};

const NO_HIGHLIGHTS: Highlights = { selected: null, classic: [], hex: [] };

/** The board itself, shared by the game and the home preview. */
function HexBoard(props: {
  view: FrenchView;
  flipped: boolean;
  highlights?: Highlights;
  onCell?: (cell: number) => void;
  label: string;
}) {
  const { view, flipped, highlights = NO_HIGHLIGHTS, onCell } = props;
  const hatch = `hatch-${useId().replace(/\W/g, "")}`;
  const center = (cell: number) => hexCenter(cell, flipped);
  const forbidden = new Set(view.forbidden.map((board) => BOARDS.indexOf(board)));
  const selectedBoard = highlights.selected === null ? null : boardOf(highlights.selected);
  const hexTargets = new Set(highlights.hex);
  const lastMove = view.lastMove ? [view.lastMove.from, view.lastMove.to].map(toCellIndex) : [];
  const pieces = Object.entries(view.pieces).flatMap(([cell, piece]) =>
    piece ? [[toCellIndex(cell), piece] as const] : [],
  );

  return (
    <svg
      className="hex-board-svg"
      viewBox={`0 0 ${WORLD.width.toFixed(2)} ${WORLD.height.toFixed(2)}`}
      role="img"
      aria-label={props.label}
    >
      <defs>
        <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" className="hex-hatch" />
        </pattern>
      </defs>

      {/* Hexagons, at full size so clicks never fall between two of them; the stroke draws the gaps. */}
      {ALL_CELLS.map((cell) => {
        const dim = selectedBoard !== null && boardOf(cell) !== selectedBoard && !hexTargets.has(cell);
        return (
          <polygon
            key={cell}
            points={hexPoints(center(cell), R)}
            fill={fill(cell)}
            className={`hex-cell${dim ? " dim" : ""}${forbidden.has(boardOf(cell)) ? " forbidden" : ""}`}
            onClick={onCell && (() => onCell(cell))}
          />
        );
      })}

      <g className="hex-marks">
        {ALL_CELLS.filter((cell) => forbidden.has(boardOf(cell))).map((cell) => (
          <polygon key={cell} points={hexPoints(center(cell), R)} fill={`url(#${hatch})`} />
        ))}
        {lastMove.map((cell) => (
          <polygon
            key={`last-${cell}`}
            points={hexPoints(center(cell), R * 0.78)}
            className={`hex-last ${isDark(cell) ? "on-dark" : "on-light"}`}
          />
        ))}
        {view.check.map((cell) => (
          <polygon key={`check-${cell}`} points={hexPoints(center(toCellIndex(cell)), R * 0.9)} className="hex-check" />
        ))}
        {highlights.selected !== null && (
          <polygon points={hexPoints(center(highlights.selected), R * 0.86)} className="hex-selected" />
        )}
      </g>

      <g className="hex-pieces">
        {pieces.map(([cell, piece]) => {
          const { x, y } = center(cell);
          return (
            <svg
              key={cell}
              x={x - PIECE_SIZE / 2}
              y={y - PIECE_SIZE / 2}
              width={PIECE_SIZE}
              height={PIECE_SIZE}
              className={piece.color === "w" ? "hex-piece white" : "hex-piece black"}
            >
              {drawPiece(piece)}
            </svg>
          );
        })}
      </g>

      <g className="hex-hints">
        {highlights.hex.map((cell) => (
          <polygon key={`hex-${cell}`} points={hexPoints(center(cell), R * 0.3)} className="hint-hex" />
        ))}
        {highlights.classic.map((cell) => {
          const { x, y } = center(cell);
          return view.pieces[toCell(cell)] ? (
            <circle key={`classic-${cell}`} cx={x} cy={y} r={R * 0.8} className="hint-capture" />
          ) : (
            <circle key={`classic-${cell}`} cx={x} cy={y} r={R * 0.24} className="hint-move" />
          );
        })}
      </g>
    </svg>
  );
}

function drawPiece(piece: ViewPiece) {
  const draw = defaultPieces[piece.color + piece.kind.toUpperCase()];
  return draw ? draw() : <text>{piece.kind}</text>;
}

function Board({ view, player, flipped, play }: BoardProps<FrenchView>) {
  // Piece clicked by the player: its destinations are shown. Tied to the view
  // it was made on, so it is cleared after a move and whenever the server
  // sends a new state.
  const [selection, setSelection] = useState<{ view: FrenchView; cell: number } | null>(null);
  const selected = selection?.view === view ? selection.cell : null;
  const select = (cell: number | null) => setSelection(cell === null ? null : { view, cell });

  const destinations = (moves: FrenchView["moves"]) =>
    (player !== null && selected !== null && moves[toCell(selected)]?.map(toCellIndex)) || [];
  const classic = destinations(view.moves);
  const hex = destinations(view.hexMoves);

  // Click a piece to see its moves, then click one of them to play it. Clicking the
  // selected piece again, or any other hexagon, cancels the selection.
  function onCell(cell: number) {
    if (selected !== null && (classic.includes(cell) || hex.includes(cell))) {
      select(null);
      play({ from: toCell(selected), to: toCell(cell) });
      return;
    }
    const mine = player !== null && view.pieces[toCell(cell)]?.color === player;
    select(cell !== selected && mine ? cell : null);
  }

  return (
    <div className={`hex-board${player ? " playable" : ""}`}>
      <Scores view={view} />
      <HexBoard
        view={view}
        flipped={flipped}
        highlights={{ selected, classic, hex }}
        onCell={onCell}
        label="Plateau des Échecs Français : quatre échiquiers imbriqués sur une grille d'hexagones"
      />
      <p className="hex-legend">
        <span>
          <svg viewBox="-10 -10 20 20" aria-hidden="true">
            <circle r={R * 0.24} className="hint-move" />
          </svg>
          Coup classique
        </span>
        <span>
          <svg viewBox="-10 -10 20 20" aria-hidden="true">
            <polygon points={hexPoints({ x: 0, y: 0 }, R * 0.3)} className="hint-hex" />
          </svg>
          Déplacement hexagonal
        </span>
      </p>
    </div>
  );
}

const COLOR_NAMES: Record<Color, string> = { w: "Blancs", b: "Noirs" };

/** Mates of each player, and the boards they made forbidden. */
function Scores({ view }: { view: FrenchView }) {
  return (
    <div className="hex-scores">
      <span className="hex-score-label">Mats</span>
      {(["w", "b"] as const).map((color) => (
        <span key={color} className="hex-score">
          <i className={`chip ${color === "w" ? "white" : "black"}`} aria-hidden="true" />
          {COLOR_NAMES[color]} <strong>{view.score[color]}</strong>
        </span>
      ))}
      {view.forbidden.length > 0 && (
        <span className="hex-forbidden">
          Zone{view.forbidden.length > 1 ? "s" : ""} interdite{view.forbidden.length > 1 ? "s" : ""} :{" "}
          {view.forbidden.map((board) => `échiquier ${PALETTE[board].name}`).join(", ")}
        </span>
      )}
    </div>
  );
}

function Preview({ view }: { view: FrenchView }) {
  return (
    <div className="hex-preview">
      <HexBoard view={view} flipped={false} label="Position de départ des Échecs Français" />
    </div>
  );
}

export const frenchUI: ModeUI<FrenchView> = { Board, Preview };

import { useState } from "react";
import { Chessboard, type PieceDropHandlerArgs, type PositionDataType } from "react-chessboard";
import { usePartySocket } from "partysocket/react";
import type { BoardView, Color, GameMode, Seat } from "../core";
import { modes } from "../modes";
import type { ClientMessage, GameState, ServerMessage } from "../protocol";
import { getToken } from "./identity";

export function Game({ id, name }: { id: string; name: string }) {
  const [seat, setSeat] = useState<Seat | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  // Mode state shown right after our move, while waiting for the server to confirm it.
  const [optimistic, setOptimistic] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const socket = usePartySocket({
    party: "game-room",
    room: id,
    query: { token: getToken(), name, ...(soloRequested() ? { solo: "" } : {}) },
    onMessage(event) {
      const msg: ServerMessage = JSON.parse(event.data);
      if (msg.type === "welcome") setSeat(msg.seat);
      if (msg.type === "state") {
        setState(msg.state);
        setOptimistic(null);
        setError(null);
      }
      if (msg.type === "error") {
        setOptimistic(null);
        setError(msg.message);
      }
    },
  });

  if (!state || !seat) return <main className="game">Connexion…</main>;

  const mode = modes[state.mode];
  const current = optimistic ?? state.state;
  const view = mode.view(current, seat);
  const player = mode.toPlay(current);
  const myTurn = player !== null && (seat === player || seat === "both");

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
    if (!player || !myTurn || !targetSquare) return false;
    const action = { from: sourceSquare, to: targetSquare };
    const next = mode.play(current, action, player);
    if (!next) return false;
    setOptimistic(next);
    socket.send(JSON.stringify({ type: "action", action } satisfies ClientMessage));
    return true;
  }

  async function copyLink() {
    await navigator.clipboard.writeText(location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="game">
      <header>
        <span>
          ⬜ {state.players.w ?? "en attente…"} — ⬛ {state.players.b ?? "en attente…"}
        </span>
        <button onClick={copyLink}>{copied ? "Lien copié !" : "Copier le lien"}</button>
      </header>

      <div className="board">
        <Chessboard
          options={{
            id: "game",
            position: toPosition(view),
            boardOrientation: seat === "b" ? "black" : "white",
            allowDragging: myTurn,
            canDragPiece: ({ piece }) => piece.pieceType[0] === view.turn,
            onPieceDrop,
          }}
        />
      </div>

      <p className="status">{statusText(mode, current, view, seat)}</p>
      {error && <p className="error">{error}</p>}
    </main>
  );
}

/** react-chessboard position: piece codes like "wK" ("w" + the kind in uppercase). */
function toPosition(view: BoardView): PositionDataType {
  const position: PositionDataType = {};
  for (const [square, piece] of Object.entries(view.pieces)) {
    if (piece) position[square] = { pieceType: piece.color + piece.kind.toUpperCase() };
  }
  return position;
}

function colorName(color: Color): string {
  return color === "w" ? "les blancs" : "les noirs";
}

function statusText(mode: GameMode<unknown, unknown>, state: unknown, view: BoardView, seat: Seat): string {
  const status = mode.status(state);
  if (status.kind === "win") {
    const reason = mode.reasons[status.reason] ?? status.reason;
    if (seat === "spectator" || seat === "both") return `${reason} : ${colorName(status.winner)} gagnent.`;
    return status.winner === seat ? `${reason} : vous avez gagné !` : `${reason} : vous avez perdu.`;
  }
  if (status.kind === "draw") return `Partie nulle : ${(mode.reasons[status.reason] ?? status.reason).toLowerCase()}.`;
  const check = view.check.length > 0 ? "Échec ! " : "";
  const turn = view.turn ?? "w";
  const toMove = `aux ${turn === "w" ? "blancs" : "noirs"} de jouer`;
  if (seat === "spectator") return `${check}Vous regardez la partie (${toMove}).`;
  if (seat === "both") return `${check}Partie solo : ${toMove}.`;
  return check + (seat === turn ? "À vous de jouer." : "À l'adversaire de jouer.");
}

function soloRequested(): boolean {
  return import.meta.env.DEV && new URLSearchParams(location.search).has("solo");
}

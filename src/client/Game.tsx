import { useState } from "react";
import { Chessboard, type PieceDropHandlerArgs } from "react-chessboard";
import usePartySocket from "partysocket/react";
import type { ClientMessage, GameState, Seat, ServerMessage } from "../protocol";
import { variants, type Move, type Position } from "../rules";
import { getToken } from "./identity";

export function Game({ id, name }: { id: string; name: string }) {
  const [seat, setSeat] = useState<Seat | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  // Position shown right after our move, while waiting for the server to confirm it.
  const [optimistic, setOptimistic] = useState<Position | null>(null);
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

  if (!state || !seat) return <main className="game">Connecting…</main>;

  const position = optimistic ?? state.position;
  const mySide = (color: string) => seat === color || seat === "both";
  const myTurn = mySide(position.turn) && position.status.kind === "playing";

  function onPieceDrop({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
    if (!state || !myTurn || !targetSquare) return false;
    const isPawn = piece.pieceType[1] === "P";
    const lastRank = targetSquare[1] === "8" || targetSquare[1] === "1";
    const move: Move = { from: sourceSquare, to: targetSquare, ...(isPawn && lastRank ? { promotion: "q" } : {}) };

    const next = variants[state.variant].play(state.moves, move);
    if (!next) return false;
    setOptimistic(next);
    socket.send(JSON.stringify({ type: "move", move } satisfies ClientMessage));
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
          ⬜ {state.players.w ?? "waiting…"} — ⬛ {state.players.b ?? "waiting…"}
        </span>
        <button onClick={copyLink}>{copied ? "Link copied!" : "Copy link"}</button>
      </header>

      <div className="board">
        <Chessboard
          options={{
            id: "game",
            position: position.fen,
            boardOrientation: seat === "b" ? "black" : "white",
            allowDragging: myTurn,
            canDragPiece: ({ piece }) => piece.pieceType[0] === position.turn,
            onPieceDrop,
          }}
        />
      </div>

      <p className="status">{statusText(position, seat)}</p>
      {error && <p className="error">{error}</p>}
    </main>
  );
}

function statusText(position: Position, seat: Seat): string {
  const { status } = position;
  if (status.kind === "checkmate") {
    if (seat === "spectator" || seat === "both") return `Checkmate, ${status.winner === "w" ? "white" : "black"} wins.`;
    return status.winner === seat ? "Checkmate, you won!" : "Checkmate, you lost.";
  }
  if (status.kind === "draw") return "Draw.";
  const check = position.inCheck ? "Check! " : "";
  const toMove = `${position.turn === "w" ? "white" : "black"} to move`;
  if (seat === "spectator") return `${check}You are watching (${toMove}).`;
  if (seat === "both") return `${check}Solo game: ${toMove}.`;
  return check + (seat === position.turn ? "Your turn." : "Opponent's turn.");
}

function soloRequested(): boolean {
  return import.meta.env.DEV && new URLSearchParams(location.search).has("solo");
}

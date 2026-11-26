import { useMemo, useState } from "react";
import { usePartySocket } from "partysocket/react";
import type { BaseView, Color, GameMode, Seat } from "../core";
import { modes } from "../modes";
import { modeUIs } from "../modes/ui";
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
    // `mode` only matters to a new room: it picks the game mode.
    query: { token: getToken(), name, ...requestedMode(), ...(soloRequested() ? { solo: "" } : {}) },
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

  const mode = state && modes[state.mode];
  const current = state && (optimistic ?? state.state);
  // Kept while the position does not change: the board ties its selection to it.
  const view = useMemo(() => (mode && seat ? mode.view(current, seat) : null), [mode, current, seat]);

  if (!state || !seat || !mode || !view) return <main className="game">Connexion…</main>;

  const { Board } = modeUIs[mode.id];
  const player = mode.toPlay(current);
  const myTurn = player !== null && (seat === player || seat === "both");

  function play(action: unknown): boolean {
    if (!mode || !player || !myTurn) return false; // `mode` is not narrowed in closures
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
          <strong>{mode.name}</strong> · ⬜ {state.players.w ?? "en attente…"} — ⬛ {state.players.b ?? "en attente…"}
        </span>
        <button onClick={copyLink}>{copied ? "Lien copié !" : "Copier le lien"}</button>
      </header>

      <div className="board">
        <Board view={view} player={myTurn ? player : null} flipped={seat === "b"} play={play} />
      </div>

      <p className="status">{statusText(mode, current, view, seat)}</p>
      {error && <p className="error">{error}</p>}
    </main>
  );
}

function colorName(color: Color): string {
  return color === "w" ? "les blancs" : "les noirs";
}

function statusText(mode: GameMode<unknown, unknown, BaseView>, state: unknown, view: BaseView, seat: Seat): string {
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

function requestedMode(): { mode?: string } {
  const mode = new URLSearchParams(location.search).get("mode");
  return mode ? { mode } : {};
}

function soloRequested(): boolean {
  return new URLSearchParams(location.search).has("solo");
}

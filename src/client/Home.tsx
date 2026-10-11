// The home screen: the player's nickname, one card per game mode to create a
// game, and a field to join a game from its link or code. Also the invite
// screen, shown when a game link is opened without a nickname.

import { useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { GameMode } from "../core";
import { modes } from "../modes";
import { parseGameInput } from "./gameLink";
import { randomId } from "./identity";
import { pieceRenderers, toPosition } from "./pieces";

export function Home({ name, onNameChange }: { name: string; onNameChange: (name: string) => void }) {
  const [editing, setEditing] = useState(!name);

  return (
    <div className="home">
      <main>
        <Hero />

        <section className="player">
          {editing ? (
            <NameForm
              initial={name}
              label={name ? "Votre pseudo" : "Choisissez un pseudo pour jouer"}
              submitLabel={name ? "Valider" : "C'est parti"}
              onSubmit={(newName) => {
                onNameChange(newName);
                setEditing(false);
              }}
            />
          ) : (
            <p>
              Vous jouez en tant que <strong>{name}</strong>
              <button className="link" onClick={() => setEditing(true)}>
                Changer
              </button>
            </p>
          )}
        </section>

        <section>
          <h2>Choisissez un mode</h2>
          <div className="mode-grid">
            {Object.values(modes).map((mode) => (
              <ModeCard key={mode.id} mode={mode} disabled={!name} onPlay={(solo) => createGame(mode.id, solo)} />
            ))}
          </div>
        </section>

        <JoinForm />
      </main>
    </div>
  );
}

function createGame(mode: string, solo: boolean) {
  const query = new URLSearchParams({ mode });
  if (solo) query.set("solo", "");
  location.assign(`/g/${randomId(10)}?${query}`);
}

export function Invite({ onJoin }: { onJoin: (name: string) => void }) {
  return (
    <div className="home">
      <main>
        <Hero />
        <section className="card invite">
          <h2>On vous invite à une partie !</h2>
          <NameForm
            initial=""
            label="Choisissez un pseudo pour la rejoindre"
            submitLabel="Rejoindre la partie"
            onSubmit={onJoin}
          />
        </section>
      </main>
    </div>
  );
}

function Hero() {
  return (
    <header className="hero">
      <h1>
        <span aria-hidden="true">♞</span> Uncle Chess
      </h1>
      <p>Des variantes d'échecs inventées par tonton, à jouer à deux.</p>
    </header>
  );
}

function ModeCard(props: { mode: GameMode<unknown, unknown>; disabled: boolean; onPlay: (solo: boolean) => void }) {
  const { mode } = props;
  const view = useMemo(() => mode.view(mode.setup(), "w"), [mode]);
  return (
    <article className="card mode-card">
      <div className="preview" aria-hidden="true">
        <Chessboard
          options={{
            id: `preview-${mode.id}`,
            position: toPosition(view),
            pieces: pieceRenderers(view, mode.id, false),
            allowDragging: false,
            showNotation: false,
            showAnimations: false,
          }}
        />
      </div>
      <div className="mode-body">
        <h3>{mode.name}</h3>
        <p>{mode.description}</p>
        <div className="actions">
          <button disabled={props.disabled} onClick={() => props.onPlay(false)}>
            Jouer
          </button>
          {/* Solo play (one player holds both sides) is only available in development. */}
          {import.meta.env.DEV && (
            <button className="secondary" disabled={props.disabled} onClick={() => props.onPlay(true)}>
              Solo
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function JoinForm() {
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);
  return (
    <section className="card join">
      <h2>Rejoindre une partie</h2>
      <form
        className="inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          const id = parseGameInput(value);
          if (id) location.assign(`/g/${id}`);
          else setInvalid(true);
        }}
      >
        <input
          aria-label="Lien ou code de la partie"
          placeholder="Lien ou code de la partie"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setInvalid(false);
          }}
        />
        <button type="submit" disabled={!value.trim()}>
          Rejoindre
        </button>
      </form>
      {invalid && <p className="error">Ce n'est pas un lien ou un code de partie.</p>}
    </section>
  );
}

function NameForm(props: { initial: string; label: string; submitLabel: string; onSubmit: (name: string) => void }) {
  const [value, setValue] = useState(props.initial);
  return (
    <form
      className="inline-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) props.onSubmit(value.trim());
      }}
    >
      <label htmlFor="name">{props.label}</label>
      <input
        id="name"
        autoFocus
        placeholder="Votre pseudo"
        maxLength={30}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit" disabled={!value.trim()}>
        {props.submitLabel}
      </button>
    </form>
  );
}

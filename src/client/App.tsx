import { useState } from "react";
import { defaultMode, modes } from "../modes";
import { Game } from "./Game";
import { getName, randomId, setName } from "./identity";

export function App() {
  const gameId = location.pathname.match(/^\/g\/([a-z0-9]+)$/)?.[1];
  const [name, setNameState] = useState(getName);

  if (gameId && name) return <Game id={gameId} name={name} />;

  return (
    <main className="home">
      <h1>Uncle Chess</h1>
      <NameForm
        initial={name}
        submitLabel={gameId ? "Rejoindre la partie" : "Créer une partie"}
        onSubmit={(newName, mode, solo) => {
          setName(newName);
          if (gameId) return setNameState(newName);
          const query = new URLSearchParams({ mode });
          if (solo) query.set("solo", "");
          location.assign(`/g/${randomId(10)}?${query}`);
        }}
        // The mode is chosen when creating a game; joining keeps the game's mode.
        pickMode={!gameId}
        // Solo play (one player holds both sides) is only available in development.
        soloLabel={import.meta.env.DEV && !gameId ? "Créer une partie solo" : undefined}
      />
    </main>
  );
}

function NameForm(props: {
  initial: string;
  submitLabel: string;
  soloLabel?: string;
  pickMode: boolean;
  onSubmit: (name: string, mode: string, solo: boolean) => void;
}) {
  const [value, setValue] = useState(props.initial);
  const [mode, setMode] = useState(defaultMode.id);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const solo = (e.nativeEvent as SubmitEvent).submitter?.dataset.solo !== undefined;
        if (value.trim()) props.onSubmit(value.trim(), mode, solo);
      }}
    >
      <input
        autoFocus
        placeholder="Votre pseudo"
        maxLength={30}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {props.pickMode && (
        <fieldset className="modes">
          <legend>Mode de jeu</legend>
          {Object.values(modes).map((m) => (
            <label key={m.id}>
              <input type="radio" name="mode" checked={mode === m.id} onChange={() => setMode(m.id)} />
              <span>
                <strong>{m.name}</strong>
                <small>{m.description}</small>
              </span>
            </label>
          ))}
        </fieldset>
      )}
      <button type="submit" disabled={!value.trim()}>
        {props.submitLabel}
      </button>
      {props.soloLabel && (
        <button type="submit" data-solo disabled={!value.trim()}>
          {props.soloLabel}
        </button>
      )}
    </form>
  );
}

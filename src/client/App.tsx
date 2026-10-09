import { useState } from "react";
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
        submitLabel={gameId ? "Join the game" : "Create a game"}
        onSubmit={(newName, solo) => {
          setName(newName);
          if (gameId) setNameState(newName);
          else location.assign(`/g/${randomId(10)}${solo ? "?solo" : ""}`);
        }}
        // Solo play (one player holds both sides) is only available in development.
        soloLabel={import.meta.env.DEV && !gameId ? "Create a solo game" : undefined}
      />
    </main>
  );
}

function NameForm(props: {
  initial: string;
  submitLabel: string;
  soloLabel?: string;
  onSubmit: (name: string, solo: boolean) => void;
}) {
  const [value, setValue] = useState(props.initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const solo = (e.nativeEvent as SubmitEvent).submitter?.dataset.solo !== undefined;
        if (value.trim()) props.onSubmit(value.trim(), solo);
      }}
    >
      <input
        autoFocus
        placeholder="Your nickname"
        maxLength={30}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
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

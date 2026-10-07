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
        onSubmit={(newName) => {
          setName(newName);
          if (gameId) setNameState(newName);
          else location.assign(`/g/${randomId(10)}`);
        }}
      />
    </main>
  );
}

function NameForm(props: { initial: string; submitLabel: string; onSubmit: (name: string) => void }) {
  const [value, setValue] = useState(props.initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) props.onSubmit(value.trim());
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
    </form>
  );
}

import { useState } from "react";
import { Game } from "./Game";
import { gameIdFromPath } from "./gameLink";
import { Home, Invite } from "./Home";
import { getName, setName } from "./identity";

export function App() {
  const gameId = gameIdFromPath(location.pathname);
  const [name, setNameState] = useState(getName);

  function changeName(newName: string) {
    setName(newName);
    setNameState(newName);
  }

  if (gameId && name) return <Game id={gameId} name={name} />;
  if (gameId) return <Invite onJoin={changeName} />;
  return <Home name={name} onNameChange={changeName} />;
}

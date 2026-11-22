import { Component, type ReactNode } from "react";

// Without it, an error while rendering unmounts the whole app and leaves a blank page.
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="game">
        <p className="error">Oups, l'affichage a planté. La partie continue sur le serveur.</p>
        <button onClick={() => location.reload()}>Recharger</button>
      </main>
    );
  }
}

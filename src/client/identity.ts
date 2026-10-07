// The player's local identity: a nickname and a secret token, kept in the
// browser. The token lets the server give us our side back after a refresh.

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable (private browsing…): the identity only lasts as long as the page
  }
}

let fallbackToken: string | null = null;

export function getToken(): string {
  const token = read("token") ?? fallbackToken ?? randomId(24);
  fallbackToken = token;
  write("token", token);
  return token;
}

export function getName(): string {
  return read("name") ?? "";
}

export function setName(name: string) {
  write("name", name);
}

export function randomId(length: number): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

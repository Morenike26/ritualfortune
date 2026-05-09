export type FortuneEntry = {
  id: string;
  text: string;
  openedAt: number;
  user: string | null;
  txHash?: string;
  chainId?: number;
};

export type MintedCard = FortuneEntry & {
  mintTx: string;
  mintedAt: number;
};

const HISTORY_KEY = "ritual:history:v1";
const MINTS_KEY = "ritual:mints:v1";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}
function write<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const historyStore = {
  list: () => read<FortuneEntry>(HISTORY_KEY),
  add: (entry: FortuneEntry) => {
    const list = [entry, ...read<FortuneEntry>(HISTORY_KEY)].slice(0, 50);
    write(HISTORY_KEY, list);
    return list;
  },
};

export const mintsStore = {
  list: () => read<MintedCard>(MINTS_KEY),
  add: (entry: MintedCard) => {
    const list = [entry, ...read<MintedCard>(MINTS_KEY)];
    write(MINTS_KEY, list);
    return list;
  },
};

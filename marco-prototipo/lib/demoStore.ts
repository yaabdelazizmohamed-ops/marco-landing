const KEY = 'marco_demo_v1';

export interface ActivityEntry {
  ts: number;
  studentName?: string;
  studentInitials?: string;
  subject?: string;
  subjectKey?: string;
  action?: string;
  isHint?: boolean;
}

export interface SessionMessage {
  role: 'student' | 'marco' | 'user' | 'ai';
  text: string;
  ts?: number;
}

interface Store {
  feed: ActivityEntry[];
  sessions: Record<string, SessionMessage[]>;
}

function read(): Store {
  if (typeof window === 'undefined') return { feed: [], sessions: {} };
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? { feed: [], sessions: {} };
  } catch {
    return { feed: [], sessions: {} };
  }
}

function write(store: Store): void {
  localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent('marco:update'));
}

export function pushActivity(entry: Omit<ActivityEntry, 'ts'>): void {
  const store = read();
  store.feed = [{ ...entry, ts: Date.now() }, ...store.feed].slice(0, 40);
  write(store);
}

export function pushMessage(subjectKey: string, msg: Omit<SessionMessage, 'ts'>): void {
  const store = read();
  if (!store.sessions[subjectKey]) store.sessions[subjectKey] = [];
  store.sessions[subjectKey].push({ ...msg, ts: Date.now() });
  write(store);
}

export function getSession(subjectKey: string): SessionMessage[] {
  return read().sessions[subjectKey] ?? [];
}

export function getFeed(): ActivityEntry[] {
  return read().feed;
}

export function getLastActivity(): number | null {
  const feed = read().feed;
  return feed.length > 0 ? feed[0].ts : null;
}

export function getLastSubjectKey(): string | null {
  const feed = read().feed;
  const entry = feed.find(e => e.subjectKey);
  return entry?.subjectKey ?? null;
}

export function onUpdate(cb: () => void): () => void {
  const onCustom = () => cb();
  const onStorage = (e: StorageEvent) => { if (!e.key || e.key === KEY) cb(); };
  window.addEventListener('marco:update', onCustom as EventListener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener('marco:update', onCustom as EventListener);
    window.removeEventListener('storage', onStorage);
  };
}

export function formatTime(ts: number | null | undefined): string {
  if (!ts) return '';
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `Hace ${hrs}h`;
}

export function clearStore(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent('marco:update'));
  }
}

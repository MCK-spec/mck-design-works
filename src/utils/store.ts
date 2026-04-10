type Listener = () => void

const listeners: Map<string, Set<Listener>> = new Map()
const bc: BroadcastChannel | null = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('mck-store') : null

export const store = {
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore storage errors
    }
    listeners.get(key)?.forEach(fn => fn())
    try {
      bc?.postMessage({ key })
    } catch {}
  },
  get<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : defaultValue
    } catch {
      return defaultValue
    }
  },
  subscribe(key: string, listener: Listener) {
    if (!listeners.has(key)) listeners.set(key, new Set())
    listeners.get(key)!.add(listener)
    return () => {
      listeners.get(key)?.delete(listener)
    }
  },
  channel: bc
}

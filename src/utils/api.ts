const b = (import.meta as any).env?.VITE_API_BASE || '/api'
export const API_BASE: string = b
export function assetUrl(p: string): string {
  if (!p) return p
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p
  if (p.startsWith('/uploads') || p.startsWith('uploads')) {
    try {
      const u = new URL(API_BASE, window.location.origin)
      const origin = u.origin
      const normalized = p.startsWith('/') ? p : `/${p}`
      return `${origin}${normalized}`
    } catch {
      const normalized = p.startsWith('/') ? p : `/${p}`
      return normalized
    }
  }
  return p
}

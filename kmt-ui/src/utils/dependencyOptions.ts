/** Serialize parent-value → child options for field settings (one line per parent value). */
export function formatDependencyOptionMap(m: Record<string, string[]>): string {
  return Object.entries(m)
    .map(([k, v]) => `${k}: ${v.join(', ')}`)
    .join('\n')
}

/** Parse lines like `California: LA, San Diego` into a map. */
export function parseDependencyOptionMap(text: string): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t) continue
    const idx = t.indexOf(':')
    if (idx === -1) continue
    const key = t.slice(0, idx).trim()
    const rest = t.slice(idx + 1).trim()
    if (!key) continue
    out[key] = rest
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return out
}

export function unionDependencyOptions(map: Record<string, string[]> | undefined): string[] {
  if (!map) return []
  const set = new Set<string>()
  for (const arr of Object.values(map)) {
    for (const o of arr) set.add(o)
  }
  return [...set]
}

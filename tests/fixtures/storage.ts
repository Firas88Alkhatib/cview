/** In-memory Web Storage for unit tests (no DOM in the unit project). */
export class MemoryStorage implements Storage {
  private readonly map = new Map<string, string>()
  /** Set this to make setItem throw, like a full quota or blocked storage. */
  failWrites = false

  get length() {
    return this.map.size
  }

  clear() {
    this.map.clear()
  }

  getItem(key: string) {
    return this.map.get(key) ?? null
  }

  key(index: number) {
    return [...this.map.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.map.delete(key)
  }

  setItem(key: string, value: string) {
    if (this.failWrites) throw new DOMException('quota exceeded', 'QuotaExceededError')
    this.map.set(key, String(value))
  }

  keys() {
    return [...this.map.keys()]
  }
}

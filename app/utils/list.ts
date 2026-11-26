// In-place helpers for id-keyed lists inside a draft. They throw on unknown ids or indexes, so
// the store's commit() rejects the whole edit instead of silently doing nothing.

export class ListItemNotFoundError extends Error {
  constructor(id: string) {
    super(`List item not found: ${id}`)
    this.name = 'ListItemNotFoundError'
  }
}

function indexOf<T extends { id: string }>(list: T[], id: string): number {
  const index = list.findIndex((item) => item.id === id)
  if (index < 0) throw new ListItemNotFoundError(id)
  return index
}

export function updateItem<T extends { id: string }>(
  list: T[],
  id: string,
  patch: Partial<Omit<T, 'id'>>,
): void {
  Object.assign(list[indexOf(list, id)]!, patch)
}

export function removeItem<T extends { id: string }>(list: T[], id: string): void {
  list.splice(indexOf(list, id), 1)
}

/** Moves the item at `from` to `to` (both indexes in the current list). */
export function moveItem<T>(list: T[], from: number, to: number): void {
  const inRange = (i: number) => Number.isInteger(i) && i >= 0 && i < list.length
  if (!inRange(from) || !inRange(to)) throw new RangeError(`Invalid move ${from} → ${to}`)
  const [item] = list.splice(from, 1)
  list.splice(to, 0, item!)
}

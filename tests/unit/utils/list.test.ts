import { describe, expect, it } from 'vitest'
import { ListItemNotFoundError, moveItem, removeItem, updateItem } from '~/utils/list'

const items = () => [
  { id: 'a', n: 1 },
  { id: 'b', n: 2 },
  { id: 'c', n: 3 },
]

describe('list helpers', () => {
  it('updates an item by id in place', () => {
    const list = items()
    updateItem(list, 'b', { n: 20 })
    expect(list[1]).toEqual({ id: 'b', n: 20 })
  })

  it('removes an item by id', () => {
    const list = items()
    removeItem(list, 'a')
    expect(list.map((i) => i.id)).toEqual(['b', 'c'])
  })

  it.each([
    [0, 2, ['b', 'c', 'a']],
    [2, 0, ['c', 'a', 'b']],
    [1, 1, ['a', 'b', 'c']],
  ])('moves index %i to %i', (from, to, expected) => {
    const list = items()
    moveItem(list, from, to)
    expect(list.map((i) => i.id)).toEqual(expected)
  })

  it('throws on unknown ids so the store rejects the edit', () => {
    expect(() => updateItem(items(), 'x', { n: 0 })).toThrow(ListItemNotFoundError)
    expect(() => removeItem(items(), 'x')).toThrow(ListItemNotFoundError)
  })

  it.each([
    [-1, 0],
    [0, 3],
    [0.5, 1],
  ])('throws on an out-of-range move %d → %d', (from, to) => {
    expect(() => moveItem(items(), from, to)).toThrow(RangeError)
  })
})

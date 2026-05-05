import { describe, it, expect } from 'vitest'
import { toggle, type Todo } from './todo'

describe('toggle', () => {
  it('flips the done flag', () => {
    const t: Todo = { id: '1', title: 'write tests', done: false }
    expect(toggle(t).done).toBe(true)
    expect(toggle(toggle(t)).done).toBe(false)
  })
})

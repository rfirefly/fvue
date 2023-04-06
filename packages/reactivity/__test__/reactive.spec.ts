import { reactive } from '@fvue/reactivity'
import { describe, expect, it } from 'vitest'

describe('reactive', () => {
  it.skip('happy path', () => {
    const original = { a: 2 }
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    expect(observed.a).toBe(2)
    expect(observed).toMatchInlineSnapshot(`
      {
        "a": 2,
      }
    `)
  })
})

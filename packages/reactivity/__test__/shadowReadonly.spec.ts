import { describe, expect, it } from 'vitest'
import { isReadonly, shadowReadonly } from '@fvue/reactivity'

describe('shadow readonly', () => {
  it('happy path', () => {
    const obj = { a: 2, b: { c: 99 } }
    const wrapped = shadowReadonly(obj)
    expect(isReadonly(wrapped)).toBe(true)
    expect(isReadonly(wrapped.c)).toBe(false)
  })
})

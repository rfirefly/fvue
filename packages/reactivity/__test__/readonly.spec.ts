import { describe, expect, it, vitest } from 'vitest'
import { isProxy, isReadonly, readonly } from '@fvue/reactivity'

describe('readonly', () => {
  it('happy path', () => {
    const obj = { a: 2 }
    const wrapped = readonly(obj)
    expect(wrapped).not.toBe(obj)
    wrapped.a++
    expect(wrapped.a).toBe(2)
  })

  it('warn when call set', () => {
    console.warn = vitest.fn()
    const user = readonly({
      age: 10,
    })
    user.age++
    expect(console.warn).toBeCalledTimes(1)
  })

  it('is readonly', () => {
    const original = { a: 2, b: { c: 9 }, c: [{ c: 9 }] }
    expect(isProxy(original)).toBe(false)

    const observed = readonly(original)
    expect(isReadonly(observed.b)).toBe(true)
    expect(isReadonly(observed.c)).toBe(true)
    expect(isReadonly(observed.c[0])).toBe(true)

    expect(isProxy(observed)).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'
import { isProxy, isReactive, reactive } from '@fvue/reactivity'

describe('reactive', () => {
  it('happy path', () => {
    const original = {
      a: 1,
      get b() {
        return this.a * 2
      },
    }
    const observed = reactive(original)
    // 需要使用Reflect的原因，可以修改this指向
    const obj = {
      a: 99,
    }
    Object.setPrototypeOf(obj, observed)
    expect((obj as typeof original).b).toBe(198)

    expect(observed).not.toBe(original)
    expect(observed.a).toBe(1)
    expect(observed).toMatchInlineSnapshot(`
      {
        "a": 1,
        "b": 2,
      }
    `)
  })

  it('is reactive', () => {
    const original = { a: 2, b: { c: 9 }, c: [{ c: 9 }] }

    expect(isReactive(original)).toBe(false)

    const observed = reactive(original)
    expect(isReactive(observed.b)).toBe(true)
    expect(isReactive(observed.c)).toBe(true)
    expect(isReactive(observed.c[0])).toBe(true)
    expect(isProxy(observed)).toBe(true)
  })
})

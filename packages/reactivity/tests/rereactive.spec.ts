import { describe, expect, it } from 'vitest'
import { reactive } from '../resrc/reactive'

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
})

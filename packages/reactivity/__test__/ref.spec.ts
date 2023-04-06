import { describe, expect, it } from 'vitest'
import { effect, isRef, proxyRefs, reactive, ref, unRef } from '@fvue/reactivity'

describe('ref', () => {
  it('happy path', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
  })

  it('effect', () => {
    let dummy
    let count = 0
    const a = ref(1)
    effect(() => {
      count++
      dummy = a.value
    })
    a.value++
    expect(count).toBe(2)
    expect(dummy).toBe(2)
    // 设置相同值，不触发effect
    a.value = 2
    expect(count).toBe(2)
  })

  it('ref with obj', () => {
    let dummy

    const obj = {
      a: 1,
    }
    const data = ref(obj)
    effect(() => {
      dummy = data.value.a
    })

    data.value.a++
    expect(dummy).toBe(2)

    data.value.a = 99
    expect(dummy).toBe(99)

    // 设置相同值，不触发effect
    data.value = { a: 'test' }
    expect(dummy).toBe('test')
  })

  it('isRef', () => {
    const a = ref(1)
    expect(isRef(a)).toBe(true)
    const b = reactive({ a: 99 })
    expect(isRef(b)).toBe(false)
  })

  it('unRef', () => {
    const a = ref(1)
    expect(unRef(a)).toBe(1)
    expect(unRef(9)).toBe(9)
  })

  it('proxyRefs', () => {
    const user = {
      age: ref(10),
      name: 'xiaohong',
    }
    const proxyUser = proxyRefs(user)
    expect(user.age.value).toBe(10)
    expect(proxyUser.age).toBe(10)
    expect(proxyUser.name).toBe('xiaohong');

    (proxyUser as any).age = 20
    expect(proxyUser.age).toBe(20)
    expect(user.age.value).toBe(20)

    proxyUser.age = ref(10)
    expect(proxyUser.age).toBe(10)
    expect(user.age.value).toBe(10)
  })
})

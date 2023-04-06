import { computed, reactive } from '@fvue/reactivity'
import { describe, expect, it, vitest } from 'vitest'

describe('computed', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10,
    })
    const fn = vitest.fn(() => user.age)
    const val = computed(fn)

    expect(fn).not.toHaveBeenCalled()
    expect(val.value).toBe(10)
    expect(fn).toHaveBeenCalledTimes(1)
    // 缓存机制
    user.age = 11
    expect(fn).toHaveBeenCalledTimes(1)
    val.value
    expect(fn).toHaveBeenCalledTimes(2)

    val.value
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

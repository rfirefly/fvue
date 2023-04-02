import { describe, expect, it, vitest } from 'vitest'
import { reactive } from '../resrc/reactive'
import { effect, stop } from '../resrc/effect'

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10,
    })

    let nextAge = 0
    effect(() => {
      nextAge = user.age + 1
    })

    expect(nextAge).toBe(11)

    user.age++
    expect(nextAge).toBe(12)
  })

  it('return runner', () => {
    let a = 10

    const runner = effect(() => {
      a++
      return 'foo'
    })

    expect(a).toBe(11)
    const res = runner()
    expect(a).toBe(12)
    expect(res).toBe('foo')
  })

  it('scheduler', () => {
    let dummy
    let runner
    let times = 0
    // 每触发两次track，执行一次effect
    const scheduler = vitest.fn(() => {
      times++
      if (times < 2)
        return

      runner()
      times = 0
    })
    const obj = reactive({ a: 1 })
    runner = effect(() => {
      dummy = obj.a
    }, { scheduler })

    expect(dummy).toBe(1)

    obj.a++
    obj.a++
    obj.a++

    expect(scheduler).toBeCalledTimes(3)

    expect(dummy).toBe(3)
    runner()
    expect(dummy).toBe(4)
  })

  it.skip('stop', () => {
    let dummy
    const obj = reactive({ a: 2 })

    const runner = effect(() => {
      dummy = obj.a
    })

    expect(dummy).toBe(2)
    obj.a++
    expect(dummy).toBe(3)
    // stop 仅对runner生效，对 reactive，他会重新收集effect，并执行
    runner.effect.stop()
    obj.a++
    runner()
    expect(dummy).toBe(3)
  })

  it('stop', () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    // obj.prop = 3
    obj.prop++
    expect(dummy).toBe(2)

    // stopped effect should still be manually callable
    runner()
    expect(dummy).toBe(3)
  })

  it('events: onStop', () => {
    const onStop = vitest.fn()
    const runner = effect(() => {}, {
      onStop,
    })

    stop(runner)
    expect(onStop).toHaveBeenCalled()
  })
})

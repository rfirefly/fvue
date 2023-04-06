import { extend } from '@fvue/shared'

let activeEffect: ReactiveEffect
let shouldTrack = true

function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect
  for (let i = 0; i < deps.length; i++)
    deps[i].delete(effect)

  deps.length = 0
}

export class ReactiveEffect {
  deps: Array<Set<ReactiveEffect>> = []
  onStop: () => void
  private active = true
  constructor(private _fn: Function, public scheduler = null) {
  }

  run() {
    if (!this.active)
      return this._fn()

    shouldTrack = true
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    activeEffect = this
    const res = this._fn()
    shouldTrack = false
    return res
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)
      this.onStop && this.onStop()
      this.active = false
    }
  }
}

interface EffectOptions {
  scheduler?: Function
  onStop?: () => void
}
export function effect(fn: Function, options: EffectOptions = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  extend(_effect, options)

  _effect.run()
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

export function stop(runner) {
  const { effect } = runner
  effect.stop()
}

const targetMap = new WeakMap()
export function track(target: object, type: string, key: string | symbol) {
  if (!activeEffect || !shouldTrack)
    return

  let depsMap = targetMap.get(target)
  if (!depsMap)
    targetMap.set(target, (depsMap = new Map()))

  let dep: Set<ReactiveEffect> = depsMap.get(key)
  if (!dep)
    depsMap.set(key, dep = new Set())
  trackEffect(dep)
}

export function trackEffect(dep) {
  if (!activeEffect)
    return
  const shouldTrack = !dep.has(activeEffect)
  if (shouldTrack) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

export function trigger(target: object, type: string, key: string | symbol) {
  const depsMap = targetMap.get(target)
  if (!depsMap)
    return
  const effects = depsMap.get(key)

  triggerEffect(effects)
}

export function triggerEffect(effects) {
  if (!effects)
    return

  effects.forEach((effect: ReactiveEffect) => {
    if (effect.scheduler) {
    // 更新调用 scheduler
      effect.scheduler()
    } else {
      effect.run()
    }
  })
}

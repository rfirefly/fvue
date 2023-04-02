import { recordEffectScope } from './effectScope'

let activeEffect: ReactiveEffect

export function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect
  deps.forEach(dep => dep.delete(effect))
}

export class ReactiveEffect {
  public parent = null
  public active = true
  //   记录所有他依赖的属性
  public deps = new Set<Set<ReactiveEffect>>()
  constructor(public fn, public scheduler = null) {
    recordEffectScope(this)
  }

  run() {
    // 非激活状态，无需依赖收集
    if (!this.active)
      return this.fn()

    // 依赖收集
    try {
      // 利用链式结构，处理嵌套effect 导致 activeEffect 指向错误问题
      this.parent = activeEffect
      // 此时，fn可以获取到 当前运行的effect
      activeEffect = this

      cleanupEffect(this)
      return this.fn()
    }
    finally {
      activeEffect = this.parent
      this.parent = null
    }
  }

  stop() {
    this.active = false
    cleanupEffect(this)
  }
}

export function effect(fn: Function, options: any = {}) {
  // fn 可以根据状态变化，重新执行。并且可以嵌套
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // 先执行一遍
  _effect.run()

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

// 结构 {target: {attributes: Set[effect]}}
const targetMap = new WeakMap()
export function track(target, type, key) {
  if (!activeEffect)
    return
  let depsMap = targetMap.get(target)
  if (!depsMap)
    targetMap.set(target, (depsMap = new Map()))

  let deps = depsMap.get(key)
  if (!deps)
    depsMap.set(key, (deps = new Set()))

  trackEffect(deps)
}

export function trackEffect(dep) {
  if (!activeEffect)
    return
  const shouldTrack = !dep.has(activeEffect)
  if (shouldTrack) {
    dep.add(activeEffect)
    activeEffect.deps.add(dep)
  }
}

export function trigget(target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target)
  //   该对象未被依赖收集过，不处理
  if (!depsMap)
    return
  const effects = depsMap.get(key)
  effects && triggerEffect(effects)
}

export function triggerEffect(effects) {
  effects = [...effects]
  effects.forEach((effect: ReactiveEffect) => {
    // 防止无限调用
    if (activeEffect !== effect) {
      // 可以自行调度
      if (effect.scheduler)
        effect.scheduler()
      else
        effect.run()
    }
  })
}

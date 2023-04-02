import type { ReactiveEffect } from './effect'

let activeEffectScope
class EffectScope {
  active = true
  parent = null
  effects: ReactiveEffect[] = []
  scopes = new Set<EffectScope>()
  constructor(public detached) {
    if (!detached && activeEffectScope)
      activeEffectScope.scopes.add(this)
  }

  run(fn) {
    if (this.active) {
      try {
        this.parent = activeEffectScope
        activeEffectScope = this
        return fn()
      }
      finally {
        activeEffectScope = this.parent
      }
    }
  }

  stop() {
    if (this.active) {
      for (let i = 0; i < this.effects.length; i++)
        this.effects[i].stop()

      for (let i = 0; i < this.scopes.size; i++)
        this.scopes[i].stop()

      this.active = false
    }
  }
}

export function recordEffectScope(effect) {
  if (activeEffectScope && activeEffectScope.active)
    activeEffectScope.effects.push(effect)
}

export function effectScope(detached = false) {
  return new EffectScope(detached)
}

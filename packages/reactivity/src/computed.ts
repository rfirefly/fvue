import { isFunction } from '@FVue/shared'
import { ReactiveEffect, trackEffect, triggerEffect } from './effect'

class ComputedRefImpl {
  public effect
  public _dirty = true
  public __v_isReadonly = true
  public __v_isRef = true
  public _value
  public _dep = new Set()

  constructor(public getter, public setter) {
    this.effect = new ReactiveEffect(this.getter, () => {
      if (!this._dirty) {
        this._dirty = true
        // 计算属性依赖的值变化，触发更新
        triggerEffect(this._dep)
      }
    })
  }

  get value() {
    // 收集使用该计算属性的 Effect
    trackEffect(this._dep)
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }

  set value(value: any) {
    this._value = this.setter(value)
  }
}

export function computed(getterOrOptions) {
  const onlyGetter = isFunction(getterOrOptions)
  let getter
  let setter
  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => console.log('no set')
  }
  else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputedRefImpl(getter, setter)
}

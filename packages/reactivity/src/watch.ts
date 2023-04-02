import { isFunction, isObject } from '@FVue/shared'
import { ReactiveEffect } from './effect'
import { isReactive } from './reactive'

function traversal(val, set = new Set()) {
  if (!isObject(val))
    return val

  if (set.has(val))
    return val
  for (const key in val)
    traversal(val[key], set)

  return val
}

export function watch(source, cb) {
  let getter
  if (isReactive(source))
    getter = () => traversal(source)
  else if (isFunction(source))
    getter = source
  else
    return

  let cleanup
  const onCleanup = (fn) => {
    cleanup = fn
  }
  let oldValue
  const job = () => {
    if (cleanup)
      cleanup()
    const value = getter()
    cb(value, oldValue, onCleanup)
    oldValue = value
  }
  const effect = new ReactiveEffect(getter, job)

  oldValue = effect.run()
}

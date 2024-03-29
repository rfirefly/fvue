import { currentInstance, setCurrentInstance } from './component'
export const enum LifeCycleHooks {
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u',
}

// 工厂模式
export const onBeforeMount = createHook(LifeCycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifeCycleHooks.MOUNTED)
export const onBeforeUpdate = createHook(LifeCycleHooks.BEFORE_UPDATE)
export const onUpdated = createHook(LifeCycleHooks.UPDATED)

function createHook(type) {
  return (hook, target = currentInstance) => {
    if (!target)
      return
    const hooks = target[type] || (target[type] = [])
    const wrappedHook = () => {
      setCurrentInstance(target)
      hook()
      setCurrentInstance(null)
    }
    hooks.push(wrappedHook)
  }
}

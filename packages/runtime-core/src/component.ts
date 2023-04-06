import { proxyRefs, reactive } from '@fvue/reactivity'
import { ShapeFlags, hasOwn, isFunction, isObject } from '@fvue/shared'
import { initProps } from './componentProps'

// eslint-disable-next-line import/no-mutable-exports
export let currentInstance = null

export function setCurrentInstance(instance) {
  return currentInstance = instance
}
export function getCurrentInstance() {
  return currentInstance
}

const publicPropertyMap = {
  $data: instance => instance.data,
  $attrs: instance => instance.attrs,
  $slots: instance => instance.slots,
}

export function createComponentInstance(vnode, parent) {
  const { props: propsOptions = {} } = vnode.type
  const instance = {
    ctx: {},
    provides: parent?.provides || Object.create(null),
    parent,
    data: null,
    vnode,
    subTree: null,
    isMounted: false,
    update: null,
    propsOptions,
    props: {},
    attrs: {},
    proxy: null,
    setupState: {},
    slots: {},
  }
  return instance
}

const publicInstanceProxy = {
  get(target, key) {
    const { data, props, setupState } = target
    if (data && hasOwn(data, key))
      return data[key]

    if (setupState && hasOwn(setupState, key))
      return setupState[key]

    if (props && hasOwn(props, key))
      return props[key]

    const getter = publicPropertyMap[key]
    if (getter)
      return getter(target)
  },
  set(target, key, value) {
    const { data, props, setupState } = target
    if (data && hasOwn(data, key)) {
      data[key] = value
      return true
    }
    if (setupState && hasOwn(setupState, key)) {
      setupState[key] = value
      return true
    }
    if (props && hasOwn(props, key)) {
      console.warn(`attempt to set property ${key as string}`)
      return false
    }
    return true
  },
}

function initSlots(instance, children) {
  const { shapeFlag } = instance.vnode
  if (shapeFlag & ShapeFlags.SLOTS_CHILDREN)
    instance.slots = children
}

export function setupComponent(instance) {
  const { props, type, children } = instance.vnode
  // 初始化props
  initProps(instance, props)
  initSlots(instance, children)
  // 初始化代理对象，用于取值
  instance.proxy = new Proxy(instance, publicInstanceProxy)
  const data = type.data
  if (data) {
    if (!isFunction(data))
      console.warn('data is not a function')
    instance.data = reactive(data.call(instance.proxy))
  }
  const { setup, render } = type
  if (setup) {
    const setupContent = {
      emit: (event, ...args: any[]) => {
        const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
        const handler = instance.vnode.props[eventName]
        handler && handler(...args)
      },
      attrs: instance.attrs,
      slots: instance.slots,
    }
    setCurrentInstance(instance)
    const setupResult = setup(instance.props, setupContent)
    setCurrentInstance(null)

    if (isFunction(setupResult))
      instance.render = setupResult
    else if (isObject(setupResult))
      instance.setupState = proxyRefs(setupResult)
  }
  if (!instance.render)
    instance.render = render
}

export function renderComponent(instance) {
  const { vnode, render, props } = instance
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT)
    return render.call(instance.proxy, instance.proxy)
  else
    return vnode.type(props)
}

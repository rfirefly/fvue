import { proxyRefs } from '@fvue/reactivity'
import { isObject } from '@fvue/shared'

export function createComponentInstance(vnode) {
  const { props: propsOptions = {} } = vnode.type
  const instance = {
    ctx: {},
    // provides: parent?.provides || Object.create(null),
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

export function setupComponent(instance) {
  // initProps()
  // initSlot()

  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const { type } = instance.vnode
  const { setup } = type
  if (setup) {
    const setupRes = setup(instance)
    handleSetupResult(instance, setupRes)
  }
}

function handleSetupResult(instance, setupResult) {
  if (isObject(setupResult))
    instance.setupState = proxyRefs(setupResult)

  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const { type } = instance.vnode
  if (type.render)
    instance.render = type.render
}

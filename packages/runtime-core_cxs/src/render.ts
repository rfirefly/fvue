import { isObject } from '@fvue/shared'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  const { type } = vnode
  if (typeof type === 'string') {
    processElement(vnode, container)
  } else if (isObject(type)) {
    processComponent(vnode, container)
  }
}
function processText(vnode, container) {
  container.innerText = vnode.children
}
function processElement(vnode, container) {
  throw new Error('Function not implemented.')
}
function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode)

  setupComponent(instance)
  setupRenderEffect(instance, container)
}
function setupRenderEffect(instance, container) {
  const subTree = instance.render()

  patch(subTree, container)
}

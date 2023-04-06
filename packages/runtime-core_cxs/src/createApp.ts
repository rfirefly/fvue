import { render } from './render'
import { createVnode } from './vnode'

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      if (typeof rootContainer === 'string')
        rootContainer = document.querySelector(rootContainer)

      const vnode = createVnode(rootComponent)
      render(vnode, rootContainer)
    },
  }
}

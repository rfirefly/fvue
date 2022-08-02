import { NodeTypes } from '@FVue/shared'

export function transformText(node, context) {
  if (node.type === NodeTypes.TEXT) {
    return () => {
      let currentContainer = null
      const children = node.children
      console.log('🚀 ~ children', children)
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isText(child.type)) {
          if (!currentContainer) {
            currentContainer = {
              type: NodeTypes.COMPOUND_EXPRESSION,
              children: [],
            }
            children.splice(i, 1, currentContainer)
          }
          currentContainer.children.push(`+(${child.content.content})`)
        } else {
          currentContainer = null
        }
      }
    }
  }
}

function isText(node) {
  return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION
}

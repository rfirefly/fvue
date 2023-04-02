import { NodeTypes } from '@FVue/shared'

export function transformElement(node, context) {
  if (node.type === NodeTypes.ELEMENT)
    return () => {}
}

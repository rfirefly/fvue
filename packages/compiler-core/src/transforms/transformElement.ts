import { NodeTypes } from '@fvue/shared'

export function transformElement(node, context) {
  if (node.type === NodeTypes.ELEMENT)
    return () => {}
}

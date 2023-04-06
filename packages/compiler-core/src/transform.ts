import { NodeTypes } from '@fvue/shared'
import { TO_DISPLAY_STRING } from './runtimeHelpers'
import { transformElement } from './transforms/transformElement'
import { transformExpression } from './transforms/transformExpression'
import { transformText } from './transforms/transformText'

export function transform(ast) {
  const context = createTransformContext(ast)
  traverseNode(ast, context)
  return ast
}

function createTransformContext(root) {
  const context = {
    currentNode: root,
    parent: null,
    helpers: new Map(),
    helper(name) {
      const count = context.helpers.get(name) || 0
      context.helpers.set(name, count + 1)
    },
    nodeTransforms: [transformElement, transformText, transformExpression],
  }
  return context
}

function traverseNode(ast, context) {
  context.currentNode = ast
  const nodeTransforms = context.nodeTransforms
  const exitsFns = []
  for (let i = 0; i < nodeTransforms.length; i++) {
    const onExit = nodeTransforms[i](ast, context)
    onExit && exitsFns.push(onExit)
    if (!context.currentNode)
      return
  }
  switch (ast.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      traverseChildren(ast, context)
  }
  context.currentNode = ast
  let i = exitsFns.length
  while (i--)
    exitsFns[i]()
}

function traverseChildren(ast, context) {
  const children = ast.children
  for (let i = 0; i < children.length; i++)
    traverseNode(children[i], context)
}

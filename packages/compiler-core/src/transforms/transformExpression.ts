import { NodeTypes } from '@fvue/shared'

export function transformExpression(ast, context) {
  if (ast.type === NodeTypes.INTERPOLATION) {
    const exp = ast.content.content
    ast.content.content = `_ctx.${exp}`
  }
}

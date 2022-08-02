import { NodeTypes } from '@FVue/shared'
import { parse } from './parse'
import { transform } from './transform'

export function compile(template) {
  // 将dom转换为js结构
  const ast = parse(template)

  //   对ast预处理
  const transformAst = transform(ast)
  console.log('🚀 ~ transformAst', transformAst)
  // 代码生成
  //   return generate(ast)
}

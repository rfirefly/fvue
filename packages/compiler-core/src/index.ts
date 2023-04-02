import { parse } from './parse'
import { transform } from './transform'

export function compile(template) {
  // 将dom转换为js结构
  const ast = parse(template)

  //   对ast预处理
  const transformAst = transform(ast)
  // 代码生成
  //   return generate(ast)
}

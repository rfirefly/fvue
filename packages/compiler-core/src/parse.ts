import { NodeTypes } from '@FVue/shared'

export function parse(template) {
  const context = createParserContext(template)
  const start = getCursor(context)
  return createRoot(parseChildren(context), getSelection(context, start))
}

function createRoot(children, loc) {
  return {
    type: NodeTypes.ROOT,
    children,
    loc,
  }
}

function parseChildren(context) {
  const nodes = []
  while (!isEnd(context)) {
    const source: string = context.source
    let node
    if (source.startsWith('{{')) {
      node = parseInterpolation(context)
    } else if (source.startsWith('<')) {
      node = parseElement(context)
    } else {
      node = parseText(context)
    }
    if (!/^\s+$/.test(node.content)) {
      nodes.push(node)
    }
  }
  return nodes
}

function isEnd(content) {
  const source = content.source
  if (source.startsWith('</')) return true
  return !source
}

function createParserContext(template) {
  return {
    line: 1,
    column: 1,
    offset: 0,
    source: template,
    originalSource: template,
  }
}

function parseText(context) {
  const endTokens = ['<', '{{']
  let endIdx = context.source.length
  // 找到字符串结尾
  for (let i = 0; i < endTokens.length; i++) {
    let idx = context.source.indexOf(endTokens[i])
    if (idx !== -1 && idx < endIdx) {
      endIdx = idx
    }
  }

  // 创建行列信息
  const start = getCursor(context)
  const content = parseTextData(context, endIdx)

  return {
    type: NodeTypes.TEXT,
    content,
    loc: getSelection(context, start),
  }
}
function parseTextData(context, endIdx) {
  const rawText = context.source.slice(0, endIdx)
  advanceBy(context, endIdx)
  return rawText
}

function advanceBy(context, numberOfCharacters) {
  const source = context.source
  advancePositionWithMutation(context, source, numberOfCharacters)
  context.source = source.slice(numberOfCharacters)
}
function advancePositionWithMutation(context, source, endIdx) {
  let linesCount = 0
  let linePos = -1
  for (let i = 0; i < endIdx; i++) {
    if (source.charCodeAt(i) === 10) {
      linesCount++
      linePos = i
    }
  }
  context.line += linesCount
  context.offset += endIdx
  context.column = linePos === -1 ? context.column + endIdx : endIdx - linePos
}

function adcanceSpaces(context) {
  const match = /^[ \t\r\n\f]+/.exec(context.source)
  if (match) {
    advanceBy(context, match[0].length)
  }
}

function getSelection(context, start, end?) {
  end = end || getCursor(context)
  return {
    start,
    end,
    source: context.originalSource.slice(start.offset, end.offset),
  }
}

function getCursor(context) {
  const { line, column, offset } = context
  return { line, column, offset }
}
// 处理表达式
function parseInterpolation(context) {
  const start = getCursor(context)
  const closeIdx = context.source.indexOf('}}', 2)
  advanceBy(context, 2)
  const innerStart = getCursor(context)
  const innerEnd = getCursor(context)
  const rawContentLength = closeIdx - 2
  let preContent = parseTextData(context, rawContentLength)
  let content = preContent.trim()
  const startOffset = preContent.indexOf(content)
  if (startOffset > 0) {
    advancePositionWithMutation(innerStart, preContent, startOffset)
  }

  let endOffst = startOffset + content.length
  advancePositionWithMutation(innerEnd, preContent, endOffst)

  advanceBy(context, 2)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
      loc: getSelection(context, innerStart, innerEnd),
    },
    loc: getSelection(context, start),
  }
}

function parseElement(context) {
  const ele = parseTag(context)
  if (!ele.isSelfClosing) {
    const children = parseChildren(context)
    if (context.source.startsWith('</')) {
      parseTag(context)
    }
    ele.loc = getSelection(context, ele.loc.start)
    ele.children = children
  }

  return ele
}

function parseTag(context) {
  const start = getCursor(context)
  const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source)
  const tag = match[1]
  advanceBy(context, match[0].length)
  adcanceSpaces(context)
  // 处理属性
  const props = parseAttributes(context)
  // 处理结束标记
  const isSelfClosing = context.source.startsWith('/>')
  advanceBy(context, isSelfClosing ? 2 : 1)
  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    isSelfClosing,
    children: [],
    loc: getSelection(context, start),
  }
}

function parseAttributes(context) {
  const props = []
  while (
    context.source.length > 0 &&
    !context.source.startsWith('/>') &&
    !context.source.startsWith('>')
  ) {
    const attr = parseAttribute(context)
    if (attr) {
      props.push(attr)
      adcanceSpaces(context)
    }
  }
  return props
}

function parseAttribute(context) {
  const start = getCursor(context)
  const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)
  const name = match[0]
  advanceBy(context, name.length)
  adcanceSpaces(context)
  let value = null
  if (context.source.startsWith('=')) {
    advanceBy(context, 1)
    adcanceSpaces(context)
    value = parseAttributeValue(context)
  }
  return {
    type: NodeTypes.ATTRIBUTE,
    name,
    value,
    loc: getSelection(context, start),
  }
}
function parseAttributeValue(context) {
  const start = getCursor(context)
  let quote = context.source[0]
  let content
  const isQuoted = quote === `"` || quote === `'`
  if (isQuoted) {
    advanceBy(context, 1)
    const endIdx = context.source.indexOf(quote)
    content = parseTextData(context, endIdx)
    advanceBy(context, 1)
  }
  return {
    type: NodeTypes.TEXT,
    content,
    loc: getSelection(context, start),
  }
}

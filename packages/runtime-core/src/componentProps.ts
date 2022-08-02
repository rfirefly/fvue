import { reactive } from '@FVue/reactivity'
import { hasInclude, hasOwn } from '@FVue/shared'

export const initProps = (instance, rawProps) => {
  const props = {}
  const attrs = {}
  const options = instance.propsOptions || {}
  if (rawProps) {
    for (const key in rawProps) {
      let value = rawProps[key]
      // 适配 object/array 类型props
      if (hasOwn(options, key) || hasInclude(options, key)) {
        props[key] = value
      } else {
        attrs[key] = value
      }
    }
  }
  instance.props = reactive(props)
  instance.attrs = attrs
}

export const updateProps = (prevProps, nextProps) => {
  for (const key in nextProps) {
    prevProps[key] = nextProps[key]
  }

  for (const key in prevProps) {
    if (!hasOwn(nextProps, key)) {
      Reflect.deleteProperty(prevProps, key)
    }
  }
}

export const hasPropsChanged = (prevProps = {}, nextProps = {}) => {
  const nextKeys = Object.keys(nextProps)
  const prevKeys = Object.keys(prevProps)
  // 比对数量变化
  if (nextKeys.length !== prevKeys.length) return true
  // 比对值变化
  for (const key in nextKeys) {
    if (nextProps[key] !== prevKeys[key]) return true
  }

  return false
}

export const shouldUpdateComponent = (n1, n2) => {
  console.log('🚀 ~ n1, n2', n1, n2)
  const { props: prevProps, children: prevChildren } = n1
  const { props: nextProps, children: nextChildren } = n2
  if (prevProps === nextProps) return false
  if (prevChildren || nextChildren) return true
  return hasPropsChanged(prevProps, nextProps)
}

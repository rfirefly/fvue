import { shadowReadonly } from '@fvue/reactivity'
import { ShapeFlags, hasInclude, hasOwn } from '@fvue/shared'

export function initProps(instance, rawProps) {
  const props = {}
  const attrs = {}
  const options = instance.propsOptions || {}
  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key]
      // 适配 object/array 类型props
      if (hasOwn(options, key) || hasInclude(options, key))
        props[key] = value
      else
        attrs[key] = value
    }
  }
  instance.props = shadowReadonly(props)
  instance.attrs = attrs
  // 兼容函数组件
  if (instance.vnode.shapeFlag & ShapeFlags.FUNCTIONAL_COMPONENT)
    instance.props = attrs
}

export function updateProps(prevProps, nextProps) {
  for (const key in nextProps)
    prevProps[key] = nextProps[key]

  for (const key in prevProps) {
    if (!hasOwn(nextProps, key))
      Reflect.deleteProperty(prevProps, key)
  }
}
export function updateSlots(instance, nextSlots) {
  Object.assign(instance.slots, nextSlots)
}
export function hasPropsChanged(prevProps = {}, nextProps = {}) {
  const nextKeys = Object.keys(nextProps)
  const prevKeys = Object.keys(prevProps)
  // 比对数量变化
  if (nextKeys.length !== prevKeys.length)
    return true
  // 比对值变化
  for (const key in nextKeys) {
    if (nextProps[key] !== prevKeys[key])
      return true
  }

  return false
}

export function shouldUpdateComponent(n1, n2) {
  const { props: prevProps, children: prevChildren } = n1
  const { props: nextProps, children: nextChildren } = n2
  if (prevChildren || nextChildren)
    return true
  if (prevProps === nextProps)
    return false
  return hasPropsChanged(prevProps, nextProps)
}

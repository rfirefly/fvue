import { ShapeFlags } from '@FVue/shared'
import { getCurrentInstance } from '../component'
import { onMounted, onUpdated } from '../lifeCifecycle'
import { isVnode } from '../vnode'

function resetShapeFlag(vnode) {
  let shapeFlag = vnode.shapeFlag
  if (shapeFlag & ShapeFlags.COMPONENT_KEEP_ALIVE)
    shapeFlag -= ShapeFlags.COMPONENT_KEEP_ALIVE

  if (shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE)
    shapeFlag -= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE

  vnode.shapeFlag = shapeFlag
}

export const KeepAliveImpl = {
  _isKeepAlive: true,
  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array],
    max: [String, Number],
  },
  setup(props, { slots }) {
    const keys = new Set()
    const cache = new Map()
    const instance = getCurrentInstance()
    const { createElement, move } = instance.ctx.renderer
    const storeContainer = createElement('div')
    // 缓存节点
    instance.ctx.deactivate = function (vnode) {
      move(vnode, storeContainer)
    }
    instance.ctx.activate = function (vnode, container, anchor) {
      move(vnode, container)
    }

    let paddingCacheKey = null
    function cacheSubTree() {
      if (paddingCacheKey) {
        cache.set(paddingCacheKey, instance.subTree)
        paddingCacheKey = null
      }
    }
    onMounted(cacheSubTree)
    onUpdated(cacheSubTree)

    const { include, exclude, max } = props
    let current = null
    function pruneCacheEntry(key) {
      resetShapeFlag(current)
      cache.delete(key)
      keys.delete(key)
    }

    return () => {
      const vnode = slots.default && slots.default()

      if (
        !isVnode(vnode)
        || !(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT)
      )
        return vnode

      const comp = vnode.type
      const key = vnode.key || comp
      const name = comp.name

      if (
        name
        && ((include && !include.split(',').includes(name))
          || (exclude && exclude.split(',').includes(name)))
      )
        return vnode

      const cacheVnode = cache.get(key)
      if (cacheVnode) {
        vnode.component = cacheVnode.component
        // 标志已缓存
        vnode.shapeFlag |= ShapeFlags.COMPONENT_KEEP_ALIVE
        keys.delete(key)
        keys.add(key)
      }
      else {
        keys.add(key)
        paddingCacheKey = key
        if (max && keys.size > max)
          pruneCacheEntry(keys.values().next().value)
      }
      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
      current = vnode
      return vnode
    }
  },
}

export function isKeepAlive(vnode) {
  return vnode.type._isKeepAlive
}

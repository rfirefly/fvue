function createInvoker(cb) {
  const invoker = e => invoker.value(e)
  invoker.value = cb
  return invoker
}

export function patchEvent(el, eventName, nextValue) {
  const invokers = el._vei || (el._vei = {})
  let exits = invokers[eventName]
  //   已绑定过事件
  if (exits && nextValue) {
    exits.value = nextValue
    return
  }
  let event = eventName.slice(2).toLowerCase()
  if (!exits && nextValue) {
    const invoker = (invokers[eventName] = createInvoker(nextValue))
    el.addEventListener(event, invoker)
  }
  // 如需要移除
  if (exits && !nextValue) {
    el.removeEventListener(event, exits)
    invokers[eventName] = undefined
  }
}

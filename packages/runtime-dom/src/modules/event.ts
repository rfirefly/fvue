function createInvoker(cb) {
  const invoker = e => invoker.value(e)
  invoker.value = cb
  return invoker
}

export function patchEvent(el, eventName, nextValue) {
  const invokers = el._vei || (el._vei = {})
  let invoker = invokers[eventName]
  //   已绑定过事件
  if (invoker && nextValue) {
    invoker.value = nextValue
    return
  }
  const event = eventName.slice(2).toLowerCase()
  if (!invoker && nextValue) {
    invoker = (invokers[eventName] = createInvoker(nextValue))
    el.addEventListener(event, invoker)
  }
  // 如需要移除
  if (invoker && !nextValue) {
    el.removeEventListener(event, invoker)
    invokers[eventName] = undefined
  }
}

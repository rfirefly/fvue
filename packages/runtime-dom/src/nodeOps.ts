export const nodeOps = {
  insert(child, parent: Element, anchor = null) {
    parent.insertBefore(child, anchor)
  },
  remove(child) {
    const parentNode = child.parentNode
    if (parentNode)
      parentNode.removeChild(child)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  setText(node, text) {
    node.nodeValue = text
  },
  querySelector(selector) {
    return document.querySelector(selector)
  },
  parentNode(node) {
    return node.parentNode
  },
  nextSibling(node) {
    return node.nextSibling
  },
  createElement(tarName) {
    return document.createElement(tarName)
  },
  createText(text) {
    return document.createTextNode(text)
  },
}

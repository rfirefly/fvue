export function patchStyle(el, preValue, nextValue = null) {
  for (const key in nextValue) {
    el.style[key] = nextValue[key]
  }

  for (const key in preValue) {
    if (!nextValue[key]) el.style[key] = null
  }
}

import { currentInstance } from './component'

export function provide(key, value) {
  if (!currentInstance)
    return new Error('Only can use in setup()')
  const parentProvides = currentInstance.parent && currentInstance.parent.provides
  let provides = currentInstance.provides
  if (parentProvides === provides)
    provides = currentInstance.provides = Object.create(provide)

  provides[key] = value
}
export function inject(key, defaultValue) {
  if (!currentInstance)
    return new Error('Only can use in setup()')
  const provides = currentInstance.parent && currentInstance.parent.provides
  if (provides && key in provides)
    return provides[key]

  return defaultValue
}

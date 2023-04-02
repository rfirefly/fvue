import { ref } from '@FVue/reactivity'
import { isFunction } from '@FVue/shared'
import { h } from './h'
import { Fragment } from './vnode'

export function defineAsyncComponent(options) {
  if (isFunction(options))
    options = { loader: options }

  return {
    setup() {
      const loaded = ref(false)
      const error = ref(false)
      const loading = ref(false)
      const {
        loader,
        timeout,
        errorComponent,
        delay,
        loadingComponent,
        onError,
      } = options
      let comp = null

      const load = () => {
        return loader().catch((err) => {
          if (onError) {
            return new Promise((resolve, reject) => {
              const retry = () => resolve(load())
              const fail = () => reject(err)
              onError(err, retry, fail)
            })
          }
        })
      }

      load()
        .then((res) => {
          comp = res
          loaded.value = true
        })
        .catch(() => {
          error.value = true
        })
        .finally(() => {
          loading.value = false
        })
      setTimeout(() => {
        error.value = true
      }, timeout)
      if (delay) {
        setTimeout(() => {
          loading.value = true
        }, delay)
      }
      return () => {
        if (loaded.value)
          return h(comp)
        else if (error.value && errorComponent)
          return h(errorComponent)
        else if (loading.value && loadingComponent)
          return h(loadingComponent)

        return h(Fragment)
      }
    },
  }
}

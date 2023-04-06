import { h } from '../../packages/runtime-core_cxs/dist/mini-vue.esm.js'

export const App = {
  render() {
    return h('div', {}, '789')
  },
  setup() {
    return {
      message: 'hello world',
    }
  },
}

import { uuidV4FromRandomValues } from '~/utils/id'

// crypto.randomUUID only exists in secure contexts (https or localhost). @ceereals/vue-pdf calls it
// unguarded for every PDF element, so the preview crashed when the app was opened over plain http
// by IP (LAN, WSL address, phone testing). Only fills the gap; never replaces a native one. (D-46)
export default defineNuxtPlugin({
  name: 'crypto-polyfill',
  enforce: 'pre',
  setup() {
    if (typeof crypto.randomUUID !== 'function') {
      Object.defineProperty(crypto, 'randomUUID', {
        value: uuidV4FromRandomValues,
        configurable: true,
        writable: true,
      })
    }
  },
})

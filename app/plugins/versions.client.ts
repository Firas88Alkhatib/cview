import { useVersionsStore } from '~/stores/versions'

// Loads the guest's CV versions once on the client (sessionStorage, D-6), and writes pending
// edits when the tab is hidden or closed, so a debounced save is never lost.
export default defineNuxtPlugin(() => {
  const versions = useVersionsStore()
  void versions.hydrate()

  const flush = () => void versions.flush()
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
})

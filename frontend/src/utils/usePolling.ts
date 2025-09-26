import { useEffect, useRef } from 'react'

interface UsePollingOptions {
  intervalMs?: number
  active?: boolean
  immediate?: boolean
}

export function usePolling(callback: () => void | Promise<any>, options: UsePollingOptions = {}) {
  const { intervalMs = 10000, active = true, immediate = true } = options
  const timerRef = useRef<number | null>(null)
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    let stopped = false

    const run = async () => {
      try {
        await callback()
      } catch (e) {
        // swallow
      }
    }

    const start = () => {
      if (!activeRef.current || stopped) return
      // Ensure only one timer
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = window.setInterval(run, intervalMs)
      if (immediate) run()
    }

    const stop = () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    const onVisibility = () => {
      if (document.hidden) {
        stop()
      } else {
        start()
      }
    }

    if (active) {
      start()
      document.addEventListener('visibilitychange', onVisibility)
    }

    return () => {
      stopped = true
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, active])
}

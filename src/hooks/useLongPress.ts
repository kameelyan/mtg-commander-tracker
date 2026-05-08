import { useCallback, useRef } from 'react'

interface Options {
  delay?: number   // ms before hold fires
  repeat?: number  // ms between repeats while held
}

export function useLongPress(
  onTap: () => void,
  onHold: () => void,
  { delay = 380, repeat = 300 }: Options = {},
) {
  // Keep callbacks in refs so intervals always call the latest version
  const onTapRef = useRef(onTap)
  const onHoldRef = useRef(onHold)
  onTapRef.current = onTap
  onHoldRef.current = onHold

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const didHold = useRef(false)

  const cancel = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }, [])

  const start = useCallback(() => {
    didHold.current = false
    timerRef.current = setTimeout(() => {
      didHold.current = true
      onHoldRef.current()
      intervalRef.current = setInterval(() => onHoldRef.current(), repeat)
    }, delay)
  }, [delay, repeat])

  const end = useCallback(() => {
    const wasTap = !didHold.current
    cancel()
    if (wasTap) onTapRef.current()
  }, [cancel])

  return {
    onPointerDown: start,
    onPointerUp: end,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  }
}

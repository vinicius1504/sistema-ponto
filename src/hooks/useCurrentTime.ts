'use client'

import { useState, useEffect } from 'react'

export function useCurrentTime(interval = 1000) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), interval)
    return () => clearInterval(timer)
  }, [interval])

  return currentTime
}

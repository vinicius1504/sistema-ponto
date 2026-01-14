'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseFetchOptions {
  immediate?: boolean
}

interface UseFetchReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions = { immediate: true }
): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(options.immediate ?? true)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na requisição')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    refetch: execute
  }
}

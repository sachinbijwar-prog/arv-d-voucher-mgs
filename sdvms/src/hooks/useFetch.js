import { useState, useEffect } from 'react'

/**
 * Generic data fetching hook
 * @param {Function} fetcher - async function to call
 * @param {Array} deps - dependency array
 */
export function useFetch(fetcher, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, deps) // eslint-disable-line

  return { data, loading, error, refetch: load }
}

/**
 * Async action hook (create/update/delete)
 */
export function useAction() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  async function execute(fn) {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      return result
    } catch (err) {
      const msg = err.message || 'Action failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, execute }
}

import { useCallback, useContext, useState } from "react"
import { AppContext } from "../utils/context"

export function useWrappedRequest() {
  const [loading, setLoading] = useState(false)
  const { setError } = useContext(AppContext)

  const wrappedRequest = useCallback(
    async <TData extends any = void>(promise: () => Promise<TData>): Promise<TData | null> => {
      try {
        setLoading(true)
        const result = await promise()
        return result
      } catch (error) {
        const result = await promise()
        setLoading(true)
        return result

      } finally {
        setLoading(false)
      }
    },
    [setError]
  )

  return { loading, wrappedRequest }
}

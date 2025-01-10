import React from "react"

export function useLazyRef<T>(fnAble: T | (() => T)) {
  const ref = React.useRef<T>()

  if (ref.current === undefined) {
    ref.current = fnAble instanceof Function ? fnAble() : fnAble
  }

  return ref as React.MutableRefObject<T>
}

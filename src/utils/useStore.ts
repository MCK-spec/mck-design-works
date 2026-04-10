import { useState, useEffect } from 'react'
import { store } from './store'

export function useStore<T>(key: string, defaultValue: T): T {
  const [value, setValue] = useState<T>(() => store.get(key, defaultValue))
  useEffect(() => {
    const unsubscribe = store.subscribe(key, () => {
      setValue(store.get(key, defaultValue))
    })
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        setValue(store.get(key, defaultValue))
      }
    }
    window.addEventListener('storage', onStorage)
    const onChannel = (ev: MessageEvent) => {
      if ((ev.data && ev.data.key) === key) {
        setValue(store.get(key, defaultValue))
      }
    }
    store.channel?.addEventListener('message', onChannel)
    return () => {
      unsubscribe()
      window.removeEventListener('storage', onStorage)
      store.channel?.removeEventListener('message', onChannel)
    }
  }, [key, defaultValue])
  return value
}

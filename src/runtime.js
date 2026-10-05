let active = null

export function signal(initial) {
  let value = initial
  const subs = new Set()
  return {
    get() {
      if (active) subs.add(active)
      return value
    },
    set(next) {
      if (Object.is(value, next)) return
      value = next
      for (const fn of subs) fn()
    },
    subscribe(fn) {
      subs.add(fn)
      return () => subs.delete(fn)
    },
  }
}

export function computed(fn) {
  let value
  let dirty = true
  const onDep = () => {
    dirty = true
  }
  return {
    get() {
      if (!dirty) return value
      const prev = active
      active = onDep
      try {
        value = fn()
      } finally {
        active = prev
      }
      dirty = false
      return value
    },
  }
}

let active = null
let activeCleanups = null

export function signal(initial) {
  let value = initial
  let subs = new Set()
  return {
    get() {
      if (active) {
        subs.add(active)
        if (activeCleanups) {
          const fn = active
          const set = subs
          activeCleanups.push(() => set.delete(fn))
        }
      }
      return value
    },
    set(next) {
      if (Object.is(value, next)) return
      value = next
      // Fresh set for adds during notify; copy whoever never left the old set.
      const prev = subs
      subs = new Set()
      for (const fn of prev) fn()
      for (const fn of prev) subs.add(fn)
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
      const prevCleanups = activeCleanups
      active = onDep
      activeCleanups = null
      try {
        value = fn()
      } finally {
        active = prev
        activeCleanups = prevCleanups
      }
      dirty = false
      return value
    },
  }
}

export function effect(fn) {
  let cleanups = []
  const run = () => {
    for (const u of cleanups) u()
    cleanups = []
    const prev = active
    const prevCleanups = activeCleanups
    active = run
    activeCleanups = cleanups
    try {
      fn()
    } finally {
      active = prev
      activeCleanups = prevCleanups
    }
  }
  run()
}

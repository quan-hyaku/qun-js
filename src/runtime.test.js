import { expect, test } from "bun:test"
import { computed, effect, signal } from "./runtime.js"

test("runtime module loads", () => {
  expect(signal).toBeDefined()
  expect(computed).toBeDefined()
  expect(effect).toBeDefined()
})

test("set notifies subscribers", () => {
  const count = signal(0)
  let seen = null
  count.subscribe(() => {
    seen = count.get()
  })
  count.set(1)
  expect(seen).toBe(1)
})

test("set skips when value is unchanged", () => {
  const count = signal(0)
  let runs = 0
  count.subscribe(() => {
    runs++
  })
  count.set(1)
  count.set(1)
  expect(runs).toBe(1)
})

test("Object.is treats NaN as equal so a second NaN does not notify", () => {
  const cell = signal(0)
  let runs = 0
  cell.subscribe(() => {
    runs++
  })
  cell.set(NaN)
  cell.set(NaN)
  expect(runs).toBe(1)
  expect(Number.isNaN(cell.get())).toBe(true)
})

test("subscribe returns an unsubscribe that stops further notifies", () => {
  const count = signal(0)
  let runs = 0
  const stop = count.subscribe(() => {
    runs++
  })
  count.set(1)
  stop()
  count.set(2)
  expect(runs).toBe(1)
  expect(count.get()).toBe(2)
})

test("unread computed does not rerun when its source changes", () => {
  const source = signal(0)
  let runs = 0
  computed(() => {
    runs++
    return source.get() * 2
  })
  source.set(1)
  source.set(2)
  expect(runs).toBe(0)
})

test("computed read twice with no write runs its function once", () => {
  const source = signal(3)
  let runs = 0
  const doubled = computed(() => {
    runs++
    return source.get() * 2
  })
  expect(doubled.get()).toBe(6)
  expect(doubled.get()).toBe(6)
  expect(runs).toBe(1)
})

test("computed recomputes after a dependency write", () => {
  const source = signal(1)
  let runs = 0
  const plusTen = computed(() => {
    runs++
    return source.get() + 10
  })
  expect(plusTen.get()).toBe(11)
  source.set(2)
  expect(plusTen.get()).toBe(12)
  expect(runs).toBe(2)
})

test("effect runs once on create", () => {
  const count = signal(0)
  let runs = 0
  effect(() => {
    runs++
    count.get()
  })
  expect(runs).toBe(1)
})

test("after show is false, setting price does not rerun the effect; setting show does", () => {
  const show = signal(true)
  const price = signal(10)
  let runs = 0
  effect(() => {
    runs++
    if (show.get()) price.get()
  })
  expect(runs).toBe(1)
  show.set(false)
  expect(runs).toBe(2)
  price.set(99)
  expect(runs).toBe(2)
  show.set(true)
  expect(runs).toBe(3)
  price.set(100)
  expect(runs).toBe(4)
})

test("effect that re-subscribes during notify runs once per set", () => {
  const a = signal(0)
  let runs = 0
  effect(() => {
    runs++
    a.get()
  })
  a.set(1)
  a.set(2)
  expect(runs).toBe(3)
})

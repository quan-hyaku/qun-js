import { expect, test } from "bun:test"
import { computed, signal } from "./runtime.js"

test("runtime module loads", () => {
  expect(signal).toBeDefined()
  expect(computed).toBeDefined()
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

import { expect, test } from "bun:test"
import { signal } from "./runtime.js"

test("runtime module loads", () => {
  expect(signal).toBeDefined()
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

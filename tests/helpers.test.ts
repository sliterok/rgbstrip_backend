import { getCachedColor, hslToRgb, clamp } from '../src/helpers'

describe('helpers', () => {
  test('clamp limits numbers within range', () => {
    expect(clamp(0, -1, 10)).toBe(0)
    expect(clamp(0, 11, 10)).toBe(10)
    expect(clamp(0, 5, 10)).toBe(5)
  })

  test('hslToRgb converts correctly', () => {
    expect(hslToRgb(0, 1, 0.5)).toEqual([255, 0, 0])
    expect(hslToRgb(120, 1, 0.5)).toEqual([0, 255, 0])
  })

  test('getCachedColor caches by reference', () => {
    const arr = [1, 2, 3] as [number, number, number]
    const first = getCachedColor(arr)
    const second = getCachedColor(arr)
    expect(first).toBe(second)
    expect(first.rgb().r).toBe(1)
    expect(first.rgb().g).toBe(2)
    expect(first.rgb().b).toBe(3)
  })
})

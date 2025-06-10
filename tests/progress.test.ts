import { getProgressColor } from '../src/server/pattern/progress'
import { settings } from '../src/settings'
import { hsl, rgb } from 'd3-color'

describe('getProgressColor', () => {
  beforeEach(() => {
    settings.progress = { current: 0, total: 0, lastUpdate: null }
  })

  test('zero total uses base color', () => {
    const color = (getProgressColor as any)(0, 0)
    const expected = hsl(0, 0, 0.2).rgb()
    expect(color).toEqual([expected.r, expected.g, expected.b])
  })

  test('scene start overrides lightness and saturation', () => {
    settings.progress = { current: 30, total: 60, lastUpdate: null }
    const color = (getProgressColor as any)(0, 0)
    const expected = hsl(0, 0, 0.2).rgb()
    expect(color).toEqual([expected.r, expected.g, expected.b])
  })

  test('old update sets hue to 0', () => {
    settings.progress = {
      current: 10,
      total: 300,
      lastUpdate: new Date(Date.now() - 301000)
    }
    const time = Date.now()
    const color = (getProgressColor as any)(10, time)
    const hue = hsl(rgb(...(color as [number, number, number]))).h
    expect(Math.abs(hue) < 1 || Math.abs(hue - 360) < 1).toBe(true)
  })
})

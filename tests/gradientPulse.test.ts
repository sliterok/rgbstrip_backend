import { getGradientPulseColor } from '../src/backend/pattern/extra'
import { pixelsCount } from '../src/backend/shared'
import { hsl, rgb } from 'd3-color'

describe('getGradientPulseColor', () => {
  test('uses partial rainbow', () => {
    const t = 500
    const c1 = (getGradientPulseColor as any)(0, t)
    const c2 = (getGradientPulseColor as any)(pixelsCount - 1, t)
    const h1 = hsl(rgb(c1[0], c1[1], c1[2])).h
    const h2 = hsl(rgb(c2[0], c2[1], c2[2])).h
    const diff = Math.abs(h1 - h2)
    const d = Math.min(diff, 360 - diff)
    expect(d).toBeLessThanOrEqual(60)
  })
})

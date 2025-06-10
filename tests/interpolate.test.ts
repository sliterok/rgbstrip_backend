import { rgb, lab } from 'd3-color'
import { interpolateLab } from 'd3-interpolate'
import { interpolateLabArr, toRgbLab } from '../src/server/pattern/interpolate'

describe('interpolation', () => {
  function parseColor(str: string): [number, number, number] {
    return str
      .replace(/[^\d,]/g, '')
      .split(',')
      .map(Number) as [number, number, number]
  }

  function oldInterpolator(start: any, end: any) {
    const interp = interpolateLab(start, end)
    return (t: number) => parseColor(interp(t))
  }

  function newInterpolator(start: any, end: any) {
    return interpolateLabArr(toRgbLab(start).lab, toRgbLab(end).lab)
  }

  const pairs = [
    [rgb(0, 0, 0), rgb(255, 255, 255)],
    [rgb(255, 0, 0), rgb(0, 255, 0)],
    [rgb(123, 50, 200), rgb(20, 180, 90)],
  ]
  const ts = [0, 0.25, 0.5, 0.75, 1]

  pairs.forEach(([start, end], idx) => {
    const o = oldInterpolator(start, end)
    const n = newInterpolator(start, end)
    ts.forEach(t => {
      test(`pair ${idx} t=${t}`, () => {
        const co = o(t)
        const cn = n(t)
        for (let i = 0; i < 3; i++) {
          expect(Math.abs(co[i] - cn[i])).toBeLessThanOrEqual(1)
        }
      })
    })
  })
})

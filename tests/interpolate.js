import assert from 'assert'
import { rgb, lab } from 'd3-color'
import { interpolateLab } from 'd3-interpolate'

function parseColor(str) {
	return str
		.replace(/[^\d,]/g, '')
		.split(',')
		.map(Number)
}

function oldInterpolator(start, end) {
	const interp = interpolateLab(start, end)
	return t => parseColor(interp(t))
}

function interpolateLabArr(startLab, endLab) {
	const [l0, a0, b0] = startLab
	const [l1, a1, b1] = endLab
	const dl = l1 - l0
	const da = a1 - a0
	const db = b1 - b0
	const clamp = v => Math.max(0, Math.min(255, Math.round(v)))
	return t => {
		const c = lab(l0 + dl * t, a0 + da * t, b0 + db * t).rgb()
		return [clamp(c.r), clamp(c.g), clamp(c.b)]
	}
}

function toRgbLab(color) {
	const rColor = color.rgb()
	const lColor = lab(color)
	return { rgb: [rColor.r, rColor.g, rColor.b], lab: [lColor.l, lColor.a, lColor.b] }
}

function newInterpolator(start, end) {
	return interpolateLabArr(toRgbLab(start).lab, toRgbLab(end).lab)
}

const pairs = [
	[rgb(0, 0, 0), rgb(255, 255, 255)],
	[rgb(255, 0, 0), rgb(0, 255, 0)],
	[rgb(123, 50, 200), rgb(20, 180, 90)],
]
const ts = [0, 0.25, 0.5, 0.75, 1]
for (const [start, end] of pairs) {
	const o = oldInterpolator(start, end)
	const n = newInterpolator(start, end)
	for (const t of ts) {
		const co = o(t)
		const cn = n(t)
		for (let i = 0; i < 3; i++) {
			assert(Math.abs(co[i] - cn[i]) <= 1, `Mismatch at t=${t} index=${i} old=${co[i]} new=${cn[i]}`)
		}
	}
}

console.log('All interpolation tests passed')

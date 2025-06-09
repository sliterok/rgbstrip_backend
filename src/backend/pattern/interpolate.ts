import { lab, ColorCommonInstance } from 'd3-color'
import { IArrColor, IRgbLabColor } from 'src/typings'

export type ILabColor = IArrColor

export function interpolateLabArr(start: ILabColor, end: ILabColor): (t: number) => IArrColor {
	const [l0, a0, b0] = start
	const [l1, a1, b1] = end
	const dl = l1 - l0
	const da = a1 - a0
	const db = b1 - b0
	return (t: number): IArrColor => {
		const { r, g, b } = lab(l0 + dl * t, a0 + da * t, b0 + db * t).rgb()
		return [r, g, b]
	}
}

export function toRgbLab(color: ColorCommonInstance): IRgbLabColor {
	const { r, g, b } = color.rgb()
	const lColor = lab(color)
	return { rgb: [r, g, b], lab: [lColor.l, lColor.a, lColor.b] }
}

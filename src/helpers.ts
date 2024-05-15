import { ColorCommonInstance, hsl, rgb } from 'd3-color'
import { IArrColor } from './typings'

const alternativeColors = new WeakMap<IArrColor, ColorCommonInstance>()

export function getCachedColor(arrColor: IArrColor) {
	const hasInCache = arrColor && alternativeColors.has(arrColor)
	const color = hasInCache ? alternativeColors.get(arrColor)! : arrColor && rgb(...arrColor)
	if (!hasInCache && color) alternativeColors.set(arrColor, color)
	return color
}

export function hslToRgb(h: number, s: number, l: number): IArrColor {
	const { r, g, b } = hsl(h, s, l).rgb()
	return [r, g, b]
}

export const clamp = (min: number, num: number, max: number) => Math.min(Math.max(num, min), max)

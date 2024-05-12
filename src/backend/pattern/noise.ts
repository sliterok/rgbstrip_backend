// eslint-disable-next-line import/default
import RingBufferTs from 'ring-buffer-ts'
const RingBuffer = RingBufferTs.RingBuffer
import { ColorCommonInstance, rgb } from 'd3-color'
import { interpolateLab } from 'd3-interpolate'
import { IArrColor, IColorGetter, IColorMapper } from 'src/typings'
import { pixelsCount, activeColors, normalNoise, hueToColor, dynamic } from '../shared'
import { settings } from 'src/settings'

const colors = new RingBuffer<ColorCommonInstance>(activeColors + 1)
for (let i = 0; i <= activeColors; i++) colors.add(hueToColor(Math.random() * 5000))

let baseOffset = 0
let alternativeColor: ColorCommonInstance
let shouldBeAway: boolean
let shouldBeNight: boolean
const awayColor = rgb(5, 20, 5)
let lastTrueColor = Date.now()

export const noiseFrameMapper: IColorMapper = () => {
	shouldBeNight = !settings.nightOverride && dynamic.isNight
	shouldBeAway = !settings.geoOverride && dynamic.isAway
	let coeff = 0
	if (shouldBeAway || shouldBeNight) {
		const diff = Date.now() - lastTrueColor
		coeff = Math.cbrt(diff / (5 * 60 * 1000))
		const hasFullyTransitioned = coeff > 1.3
		if (hasFullyTransitioned) {
			const { r, g, b } = alternativeColor.rgb()
			return Array(pixelsCount).fill([r, g, b])
		}
	}

	const rawOffset = baseOffset + 0.006
	baseOffset = rawOffset % 1
	if (rawOffset >= 1) colors.add(getNextColor(coeff))

	return Array(pixelsCount)
		.fill(null)
		.map((_, index): IArrColor => getNoiseColor(index))
}

function getNextColor(coeff: number): ColorCommonInstance {
	const hasTransitioned = coeff > 1.1
	if (hasTransitioned && (shouldBeAway || shouldBeNight)) return alternativeColor

	let color: ColorCommonInstance = getNextRandomColor()
	if (shouldBeAway || shouldBeNight) {
		alternativeColor = getAlternativeColor()
		const interpolator = getInterpolator(color, alternativeColor)
		color = rgb(...interpolator(coeff))
	} else {
		lastTrueColor = Date.now()
	}
	return color
}

function getAlternativeColor() {
	return shouldBeNight ? rgb(...dynamic.disabledColor) : awayColor
}

let colorNoiseOffset = 0
function getNextRandomColor() {
	const colorChange = normalNoise(Date.now(), 0) ** 2 * 23 + 1 / 3
	colorNoiseOffset += colorChange

	const hue = normalNoise(colorNoiseOffset, 0) * 360 + normalNoise(0, Date.now()) * 360
	return hueToColor(hue)
}

const getNoiseColor: IColorGetter = index => {
	const now = Date.now()
	const normalPosition = index / pixelsCount
	const positionScaleNoise = 10 * normalNoise(now, index) + 3

	const x = normalPosition * positionScaleNoise
	const y = now / 5000

	const colorsOffset = normalNoise(x, y) * (activeColors - 1)
	const offset = baseOffset + colorsOffset

	const segmentIndex = Math.floor(offset)
	const segmentFraction = offset - segmentIndex

	const colorStart = colors.get(segmentIndex)!
	const colorEnd = colors.get(segmentIndex + 1)!

	const interpolator = getInterpolator(colorStart, colorEnd)
	const color = interpolator(segmentFraction ** 2)

	return color
}

const interpolators = new WeakMap<ColorCommonInstance, WeakMap<ColorCommonInstance, (t: number) => string>>()

function getInterpolator(colorStart: ColorCommonInstance, colorEnd: ColorCommonInstance): (t: number) => IArrColor {
	let interpolator: undefined | ((t: number) => string)
	let subInterpolator: WeakMap<ColorCommonInstance, (t: number) => string>
	const hadFirstColor = interpolators.has(colorStart)
	if (hadFirstColor) {
		subInterpolator = interpolators.get(colorStart)!
		interpolator = subInterpolator.get(colorEnd)
	}
	const hadSecondColor = !!interpolator
	if (!interpolator) interpolator = interpolateLab(colorStart, colorEnd)
	if (!hadFirstColor) {
		subInterpolator = new WeakMap()
		interpolators.set(colorStart, subInterpolator)
	}
	if (!hadSecondColor) subInterpolator!.set(colorEnd, interpolator)

	return t =>
		interpolator(t)
			.replace(/[^\d,]/g, '')
			.split(',')
			.map(el => parseInt(el)) as IArrColor
}

import { getTime, preWakeupTime, wakeupTimeWeekend, wakeupTime, HSLToRGB, clamp } from 'src/helpers'
import { settings } from 'src/settings'
import { pixelsCount, colorNoise, activeColors, colors, dynamic } from './shared'
import { interpolateLab } from 'd3-interpolate'
import { HSLColor } from 'd3-color'
import { IMode } from 'src/typings'

let frameIndex = 0

const interpolators = new WeakMap<HSLColor, WeakMap<HSLColor, (t: number) => string>>()

const modeToGetter: Record<IMode, [number, number, number] | ((index: number) => [number, number, number])> = {
	[IMode.Disabled]: dynamic.disabledColor,
	[IMode.Rainbow]: getRainbowColor,
	[IMode.Progress]: getProgressColor,
	[IMode.White]: [255, 255, 255],
	[IMode.Away]: [5, 20, 5],
	[IMode.Noise]: getNoiseColor,
	[IMode.Color]: settings.color,
}

export function getPixels(mode: IMode): [number, number, number][] {
	frameIndex++

	if (mode === IMode.Disabled) updateDisabledColor()

	const getter = modeToGetter[mode]
	if (getter instanceof Function) {
		return Array(pixelsCount)
			.fill(null)
			.map((_, index): [number, number, number] => getter(index))
	} else {
		return Array(pixelsCount).fill(getter)
	}
}

function updateDisabledColor() {
	if (frameIndex % 15000 === 0) {
		// every 4 minutes or something like this
		const d = new Date()
		const day = d.getDay()
		const isWeekend = [6, 7].includes(day)
		const time = getTime(d.getHours(), d.getMinutes())
		if (time >= preWakeupTime && time <= (isWeekend ? wakeupTimeWeekend : wakeupTime)) {
			if (dynamic.disabledColor[1] !== 1) dynamic.disabledColor = [0, 1, 0]
		} else {
			if (dynamic.disabledColor[2] !== 1) dynamic.disabledColor = [0, 0, 1]
		}
	}
}

function getRainbowColor(index: number): [number, number, number] {
	const color = (frameIndex + index) % 360
	return HSLToRGB(color, 50, 100)
}

function getProgressColor(index: number): [number, number, number] {
	const { current, total, lastUpdate } = settings.progress

	const mult = total / pixelsCount
	const progress = current / mult || 0 // 0 / 0 = NaN
	const dist = Math.abs(progress - index)

	let lightness = clamp(25, progress > index ? 50 : 50 - 20 * dist, 50)
	let saturation = lightness * 2
	let color = (frameIndex + index) % 360

	if (total === 0) {
		lightness = 50
		saturation = 50
	} else if (current >= total - 1) {
		color = 150
	}

	const framesPerScene = 30
	const scenes = total / framesPerScene
	const sceneLength = Math.floor(pixelsCount / scenes)
	if (index % sceneLength === 0) {
		lightness = 20
		saturation = 0
	}

	if (lastUpdate && Date.now() - lastUpdate.getTime() > 300000 && progress / total < 0.95) {
		color = 0
	}

	return HSLToRGB(color, saturation, lightness)
}

function getNoiseColor(index: number) {
	const x = index / 80 + frameIndex / 400
	const y = frameIndex / 600

	const baseOffset = ((colorNoise(x, y) + 1) / 2 + index / pixelsCount) % 1
	const segmentWidth = 1 / (activeColors - 1)
	const i = baseOffset + dynamic.offset * segmentWidth
	const segmentIndex = Math.floor(i / segmentWidth)
	const segmentFraction = (i % segmentWidth) / segmentWidth
	const colorStart = colors.get(segmentIndex)!
	const colorEnd = colors.get(segmentIndex + 1)!

	let interpolator: undefined | ((t: number) => string)
	const hadFirstColor = interpolators.has(colorStart)
	let subInterpolator: WeakMap<HSLColor, (t: number) => string>
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

	const mixed = interpolator(segmentFraction)
	return mixed
		.replace(/[^\d,]/g, '')
		.split(',')
		.map(el => parseInt(el)) as [number, number, number]
}

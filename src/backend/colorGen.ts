import { getTime, preWakeupTime, wakeupTimeWeekend, wakeupTime, HSLToRGB, clamp } from 'src/helpers'
import { settings } from 'src/settings'
import { pixelsCount, colorNoise, activeColors, colors, dynamic } from './shared'
import { interpolateLab } from 'd3-interpolate'

let disabledColor = [0, 0, 1]
let frameIndex = 0

export function getPixels(mode: number): [number, number, number][] {
	frameIndex++

	const pixels = Array(pixelsCount)
		.fill([0, 0, 0])
		.map((_, index) => {
			if (mode === 0) {
				if (index % 1000 === 0) {
					const d = new Date()
					const day = d.getDay()
					const isWeekend = [6, 7].includes(day)
					const time = getTime(d.getHours(), d.getMinutes())
					if (time >= preWakeupTime && time <= (isWeekend ? wakeupTimeWeekend : wakeupTime)) {
						if (disabledColor[1] !== 1) disabledColor = [0, 1, 0]
					} else {
						if (disabledColor[2] !== 1) disabledColor = [0, 0, 1]
					}
				}
				return disabledColor
			} else if (mode === 1) {
				const color = (frameIndex + index) % 360
				return HSLToRGB(color, 50, 100)
			} else if (mode === 2) {
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
			} else if (mode === 3) {
				return [255, 255, 255]
			} else if (mode === 4) {
				return [5, 20, 5]
			} else if (mode === 5) {
				const x = index / 80 + frameIndex / 400
				const y = frameIndex / 600

				const baseOffset = ((colorNoise(x, y) + 1) / 2 + index / pixelsCount) % 1
				const segmentWidth = 1 / (activeColors - 1)
				const i = baseOffset + dynamic.offset * segmentWidth
				const segmentIndex = Math.floor(i / segmentWidth)
				const segmentFraction = (i % segmentWidth) / segmentWidth
				const colorStart = colors.get(segmentIndex)!
				const colorEnd = colors.get(segmentIndex + 1)!

				const mixed = interpolateLab(`hsl(${colorStart}, 100%, 50%)`, `hsl(${colorEnd}, 100%, 50%)`)(segmentFraction)
				return mixed
					.replace(/[^\d,]/g, '')
					.split(',')
					.map(el => parseInt(el))
			} else if (mode === 6) {
				return settings.color
			}
		}) as [number, number, number][]

	return pixels
}

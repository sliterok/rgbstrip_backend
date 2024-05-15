import { clamp, hslToRgb } from 'src/helpers'
import { settings } from 'src/settings'
import { IColorGetter } from 'src/typings'
import { pixelsCount } from '../shared'

export const getProgressColor: IColorGetter = (index, time) => {
	const { current, total, lastUpdate } = settings.progress

	const mult = total / pixelsCount
	const progress = current / mult || 0 // 0 / 0 = NaN
	const dist = Math.abs(progress - index)

	let lightness = clamp(0.25, progress > index ? 0.5 : 0.5 - 0.2 * dist, 0.5)
	let saturation = lightness * 2
	let color = (time / 16 + index) % 360

	if (total === 0) {
		lightness = 0.5
		saturation = 0.5
	} else if (current >= total - 1) {
		color = 150
	}

	const framesPerScene = 30
	const scenes = total / framesPerScene
	const sceneLength = Math.floor(pixelsCount / scenes)
	if (index % sceneLength === 0) {
		lightness = 0.2
		saturation = 0
	}

	if (lastUpdate && time - lastUpdate.getTime() > 300000 && progress / total < 0.95) {
		color = 0
	}

	return hslToRgb(color, saturation, lightness)
}

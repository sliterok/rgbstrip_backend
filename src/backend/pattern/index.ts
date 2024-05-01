import { settings } from 'src/settings'
import { pixelsCount, dynamic } from '../shared'
import { IColorGetter, IMode } from 'src/typings'
import { getNoiseColor } from './noise'
import { getProgressColor } from './progress'
import { getRainbowColor } from './rainbow'

const modeToGetter: Record<IMode, [number, number, number] | IColorGetter> = {
	[IMode.Disabled]: dynamic.disabledColor,
	[IMode.Rainbow]: getRainbowColor,
	[IMode.Progress]: getProgressColor,
	[IMode.White]: [255, 255, 255],
	[IMode.Away]: [5, 20, 5],
	[IMode.Noise]: getNoiseColor,
	[IMode.Color]: settings.color,
}

let frameIndex = 0

export function getPixels(mode: IMode): [number, number, number][] {
	frameIndex++

	const getter = modeToGetter[mode]
	if (getter instanceof Function) {
		return Array(pixelsCount)
			.fill(null)
			.map((_, index): [number, number, number] => getter(frameIndex, index))
	} else {
		return Array(pixelsCount).fill(getter)
	}
}

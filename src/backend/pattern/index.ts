import { settings } from 'src/settings'
import { pixelsCount, dynamic } from '../shared'
import { IArrColor, IColorGetter, IMode, IStaticColorGetter } from 'src/typings'
import { getNoiseColor } from './noise'
import { getProgressColor } from './progress'
import { getRainbowColor } from './rainbow'

const modeToGetter: Record<IMode, IArrColor | IColorGetter | IStaticColorGetter> = {
	[IMode.Disabled]: () => dynamic.disabledColor,
	[IMode.Rainbow]: getRainbowColor,
	[IMode.Progress]: getProgressColor,
	[IMode.White]: [255, 255, 255],
	[IMode.Away]: [5, 20, 5],
	[IMode.Noise]: getNoiseColor,
	[IMode.Color]: () => settings.color,
}

let frameIndex = 0

const indexedModes = new Set([IMode.Rainbow, IMode.Progress, IMode.Noise])

export function getPixels(mode: IMode): IArrColor[] {
	frameIndex++

	const getter = modeToGetter[mode]
	if (indexedModes.has(mode)) {
		return Array(pixelsCount)
			.fill(null)
			.map((_, index): IArrColor => (getter as IColorGetter)(frameIndex, index))
	} else {
		const value = getter instanceof Function ? (getter as IStaticColorGetter)() : getter
		return Array(pixelsCount).fill(value)
	}
}

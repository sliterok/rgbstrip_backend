import { settings } from 'src/settings'
import { dynamic } from '../shared'
import { IArrColor, IColorMapper, IMode } from 'src/typings'
import { noiseFrameMapper } from './noise'
import { getProgressColor } from './progress'
import { getRainbowColor } from './rainbow'
import { createIndexedMapper, createFlatMapper, awayColor } from './mappers'

const mappers: Record<IMode, IColorMapper> = {
	[IMode.Disabled]: createFlatMapper(() => dynamic.disabledColor),
	[IMode.Rainbow]: createIndexedMapper(getRainbowColor),
	[IMode.Progress]: createIndexedMapper(getProgressColor),
	[IMode.White]: createFlatMapper([255, 255, 255]),
	[IMode.Away]: createFlatMapper(awayColor),
	[IMode.Noise]: noiseFrameMapper,
	[IMode.Color]: createFlatMapper(() => settings.color),
}

export function getPixels(mode: IMode): IArrColor[] {
	const mapper = mappers[mode]
	return mapper()
}

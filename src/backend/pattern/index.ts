import { settings } from 'src/settings'
import { dynamic } from '../shared'
import { IArrColor, IColorMapper, IMode } from 'src/typings'
import { noiseFrameMapper } from './noise'
import { getProgressColor } from './progress'
import { getRainbowColor } from './rainbow'
import { getPlasmaColor } from './plasma'
import { getBreatheColor } from './breathe'
import { getFireColor } from './fire'
import { getOceanColor } from './ocean'
import { getTwilightColor } from './twilight'
import { getWaveColor } from './wave'
import { createIndexedMapper, createFlatMapper } from './mappers'

const mappers: Record<IMode, IColorMapper> = {
	[IMode.Disabled]: createFlatMapper(() => dynamic.disabledColor),
	[IMode.Rainbow]: createIndexedMapper(getRainbowColor),
	[IMode.Progress]: createIndexedMapper(getProgressColor),
	[IMode.White]: createFlatMapper([255, 255, 255]),
	[IMode.Noise]: noiseFrameMapper,
	[IMode.Plasma]: createIndexedMapper(getPlasmaColor),
	[IMode.Breathe]: createIndexedMapper(getBreatheColor),
	[IMode.Fire]: createIndexedMapper(getFireColor),
	[IMode.Ocean]: createIndexedMapper(getOceanColor),
	[IMode.Twilight]: createIndexedMapper(getTwilightColor),
	[IMode.Wave]: createIndexedMapper(getWaveColor),
	[IMode.Color]: createFlatMapper(() => settings.color),
}

export function getPixels(mode: IMode): IArrColor[][] {
	const mapper = mappers[mode]
	return mapper()
}

import { IColorGetter, IArrColor, IStaticColorGetter, IColorMapper } from 'src/typings'
import { batchSize, dynamic, frameInterval, pixelsCount } from '../shared'
import { settings } from 'src/settings'

export const awayColor: IArrColor = [5, 20, 5]

export const defaultMapperMiddleware = (): IArrColor | undefined => {
	const shouldBeNight = !settings.nightOverride && dynamic.isNight
	if (shouldBeNight) return dynamic.disabledColor
	const shouldBeAway = settings.forceAway || (!settings.geoOverride && dynamic.isAway)
	if (shouldBeAway) return awayColor
}

export const callIndexedGetter = (getter: IColorGetter, onBatch?: (batchIndex: number) => void) => {
	const now = Date.now()
	return Array(batchSize)
		.fill(null)
		.map((_, batchIndex): IArrColor[] => {
			if (onBatch) onBatch(batchIndex)
			return Array(pixelsCount)
				.fill(null)
				.map((_, indexInBatch): IArrColor => getter(indexInBatch, now + batchIndex * frameInterval))
		})
}

export const createIndexedMapper =
	(getter: IColorGetter): IColorMapper =>
	() => {
		const middlewareRes = defaultMapperMiddleware()
		if (middlewareRes) return [[middlewareRes]]
		return callIndexedGetter(getter)
	}

export const createFlatMapper =
	(getter: IStaticColorGetter | IArrColor): IColorMapper =>
	() => {
		const middlewareRes = defaultMapperMiddleware()
		const value = middlewareRes || (getter instanceof Function ? getter() : getter)
		return [[value]]
	}

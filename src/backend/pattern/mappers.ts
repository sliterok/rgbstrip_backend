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

export const createIndexedMapper =
	(getter: IColorGetter): IColorMapper =>
	() => {
		const middlewareRes = defaultMapperMiddleware()
		if (middlewareRes) return [middlewareRes]

		const now = Date.now()
		return Array(pixelsCount * batchSize)
			.fill(null)
			.map((_, index): IArrColor => {
				const indexInBatch = index % pixelsCount
				const batchIndex = Math.floor(index / pixelsCount)
				return getter(indexInBatch, now + batchIndex * frameInterval)
			})
	}

export const createFlatMapper =
	(getter: IStaticColorGetter | IArrColor): IColorMapper =>
	() => {
		const middlewareRes = defaultMapperMiddleware()
		const value = middlewareRes || (getter instanceof Function ? getter() : getter)
		return [value]
	}

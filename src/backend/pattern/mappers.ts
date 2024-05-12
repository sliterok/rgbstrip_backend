import { IColorGetter, IArrColor, IStaticColorGetter, IColorMapper } from 'src/typings'
import { dynamic, pixelsCount } from '../shared'
import { settings } from 'src/settings'

export const awayColor: IArrColor = [5, 20, 5]

export const defaultMapperMiddleware = (): IArrColor | undefined => {
	const shouldBeNight = !settings.nightOverride && dynamic.isNight
	if (shouldBeNight) return dynamic.disabledColor
	const shouldBeAway = !settings.geoOverride && dynamic.isAway
	if (shouldBeAway) return awayColor
}

export const createIndexedMapper =
	(getter: IColorGetter): IColorMapper =>
	() => {
		const middlewareRes = defaultMapperMiddleware()
		if (middlewareRes) return Array(pixelsCount).fill(middlewareRes)

		return Array(pixelsCount)
			.fill(null)
			.map((_, index): IArrColor => getter(index))
	}

export const createFlatMapper =
	(getter: IStaticColorGetter | IArrColor): IColorMapper =>
	() => {
		const middlewareRes = defaultMapperMiddleware()
		const value = middlewareRes || (getter instanceof Function ? getter() : getter)
		return Array(pixelsCount).fill(value)
	}

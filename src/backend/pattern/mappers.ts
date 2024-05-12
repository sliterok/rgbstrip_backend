import { IColorGetter, IArrColor, IStaticColorGetter, IColorMapper } from 'src/typings'
import { pixelsCount } from '../shared'

export const createIndexedMapper =
	(getter: IColorGetter): IColorMapper =>
	() =>
		Array(pixelsCount)
			.fill(null)
			.map((_, index): IArrColor => getter(index))

export const createFlatMapper =
	(getter: IStaticColorGetter | IArrColor): IColorMapper =>
	() => {
		const value = getter instanceof Function ? getter() : getter
		return Array(pixelsCount).fill(value)
	}

import { HSLToRGB } from 'src/helpers'
import { IColorGetter } from 'src/typings'

export const getRainbowColor: IColorGetter = (frameIndex, index) => {
	const color = (frameIndex + index) % 360
	return HSLToRGB(color, 50, 100)
}

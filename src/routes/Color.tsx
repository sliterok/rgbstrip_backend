/* eslint-disable react-hooks/rules-of-hooks */
import { useServerSideMutation } from 'rakkasjs'
import { RgbColorPicker } from 'react-colorful'
import { settings } from '../settings'
import { IArrColor } from 'src/typings'

let lastTimestamp: number

export default function Color() {
	const mutation = useServerSideMutation(async (ctx, color: IArrColor) => {
		settings.color = color
	})

	return (
		<div>
			<RgbColorPicker
				onChange={({ r, g, b }) =>
					requestAnimationFrame(timestamp => {
						if (lastTimestamp === timestamp) return
						lastTimestamp = timestamp
						mutation.mutate([r, g, b])
					})
				}
				style={{ width: '95vw', height: '95vh' }}
			/>
		</div>
	)
}

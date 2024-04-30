/* eslint-disable react-hooks/rules-of-hooks */
import { useServerSideMutation } from 'rakkasjs'
import { RgbColorPicker } from 'react-colorful'
import { settings } from '../settings'

let timeout: NodeJS.Timeout
function useThrottle(cb: any, delay: number) {
	if (timeout) clearTimeout(timeout)
	timeout = setTimeout(cb, delay)
}

export default function Color() {
	const mutation = useServerSideMutation(async (ctx, color: [number, number, number]) => {
		settings.color = color
	})

	return (
		<div>
			<RgbColorPicker onChange={({ r, g, b }) => useThrottle(() => mutation.mutate([r, g, b]), 20)} style={{ width: '100%', height: '90vh' }} />
		</div>
	)
}

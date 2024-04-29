import { useServerSideMutation } from 'rakkasjs'
import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { settings } from '../settings'

let timeout: NodeJS.Timeout
function useThrottle(cb: any, delay: number) {
	if (timeout) clearTimeout(timeout)
	timeout = setTimeout(cb, delay)
}

export default function Color() {
	const [color, setColor] = useState('#aabbcc')

	const mutation = useServerSideMutation(async (ctx, color: string) => {
		settings.color = color
	})

	useThrottle(() => mutation.mutate(color), 50)

	return (
		<div>
			<HexColorPicker color={color} onChange={setColor} style={{ width: '100%', height: '90vh' }} />
			<button onClick={() => mutation.mutate(color)} style={{ width: '100%' }}>
				set
			</button>
		</div>
	)
}

import { getCurrentMode } from 'src/helpers'
import { broadcastMessage } from 'src/routes/debug/stream.api'
import { getPixels } from './colorGen'
import { pixelsCount, dynamic, colors, randomColor } from './shared'
import { socket } from './udp'

export function startLoop() {
	let colorChange = 0
	const buf = new Uint8Array(pixelsCount * 3)
	setInterval(() => {
		const rawOffset = dynamic.offset + 0.004
		dynamic.offset = rawOffset % 1
		if (rawOffset >= 1) colors.add(randomColor((colorChange += 7 / 3), Math.random() * 5))

		// if (import.meta.env.DEV) {
		broadcastMessage(JSON.stringify(getPixels(5)))
		// }

		if (!dynamic.target) return
		if (Date.now() - (dynamic.lastMessage || 0) > 7000) {
			delete dynamic.target
			return
		}

		const mode = getCurrentMode()

		const pixels = getPixels(mode)

		for (let index = 0; index < pixels.length; index++) {
			for (let color = 0; color < 3; color++) {
				let actualColor = color
				switch (color) {
					case 0:
						actualColor = 1
						break
					case 1:
						actualColor = 0
						break
				}
				const colorValue = pixels[index][actualColor]
				buf[index * 3 + actualColor] = actualColor === 0 ? Math.floor(colorValue * 0.7) : colorValue
			}
		}

		const { address, port } = dynamic.target
		socket.send(buf, port, address)
	}, 16)
}

import { broadcastMessage } from 'src/routes/debug/stream.api'
import { getPixels } from './pattern'
import { pixelsCount, dynamic, batchSize, frameInterval } from './shared'
import { socket } from './udp'
import { settings } from 'src/settings'
import { IArrColor, IMode } from 'src/typings'

export function startLoop() {
	setInterval(loop, frameInterval * batchSize)
}

const buf = new Uint8Array(pixelsCount * 3 * batchSize)
function loop() {
	let pixels: IArrColor[] | undefined
	if (dynamic.hasConnections) {
		pixels = getPixels(IMode.Noise)
		broadcastMessage(JSON.stringify(pixels))
	}

	if (!dynamic.target) return
	if (Date.now() - (dynamic.lastMessage || 0) > 7000) {
		delete dynamic.target
		return
	}

	if (!pixels || settings.mode !== IMode.Noise) pixels = getPixels(settings.mode)

	for (let index = 0; index < pixels.length; index++) {
		for (let color = 0; color < 3; color++) {
			let actualColor = color
			// rgb strip uses g, r, b
			switch (color) {
				case 0:
					actualColor = 1
					break
				case 1:
					actualColor = 0
					break
			}

			buf[index * 3 + color] = pixels[index][actualColor]
		}
	}

	const { address, port } = dynamic.target
	socket.send(buf, 0, pixels.length * 3, port, address)
}

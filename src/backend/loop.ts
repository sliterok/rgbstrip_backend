import { broadcastMessage } from 'src/routes/debug/stream.api'
import { getPixels } from './pattern'
import { pixelsCount, dynamic, batchSize, frameInterval } from './shared'
import { socket } from './udp'
import { settings } from 'src/settings'
import { IArrColor, IMode } from 'src/typings'

export function startLoop() {
	setInterval(loop, frameInterval * batchSize)
}

const send = (buffer: Uint8Array, length: number) =>
	new Promise<number>((res, rej) =>
		socket.send(buffer, 0, length, dynamic.target!.port, dynamic.target!.address, (err, bytes) => (err ? rej(err) : res(bytes)))
	)

const buf = new Uint8Array(pixelsCount * 3)
async function loop() {
	let pixels: IArrColor[][] | undefined
	if (dynamic.hasConnections) {
		pixels = getPixels(IMode.Noise)
		for (const packet of pixels) {
			broadcastMessage(JSON.stringify(packet))
		}
	}

	if (!dynamic.target) return
	if (Date.now() - (dynamic.lastMessage || 0) > 7000) {
		delete dynamic.target
		return
	}

	if (!pixels || settings.mode !== IMode.Noise) pixels = getPixels(settings.mode)

	for (const packet of pixels) {
		for (let index = 0; index < packet.length; index++) {
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

				buf[index * 3 + color] = packet[index][actualColor]
			}
		}
		await send(buf, packet.length * 3)
	}
}

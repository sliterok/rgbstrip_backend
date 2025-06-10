import { broadcastMessage } from 'src/routes/debug/stream.api'
import { getPixels } from './pattern'
import { dynamic, batchSize, frameInterval } from './shared'
import { sendPacket } from './udp'
import { settings } from 'src/settings'
import { IArrColor } from 'src/typings'
import { logger } from './logger'

export function startLoop() {
	setInterval(loop, frameInterval * batchSize)
}

async function loop() {
	if (!dynamic.hasConnections && !dynamic.target) return

	const packets = getPixels(settings.mode)
	try {
		for (const pixels of packets) {
			if (dynamic.hasConnections) broadcastMessage(JSON.stringify(pixels))
			if (dynamic.target) await sendPacket(convertPixels(pixels))
		}
	} catch (err) {
		logger.error('Error sending packet:', err)
	}
}

function convertPixels(pixels: IArrColor[]) {
	const buffer = new Uint8Array(pixels.length * 3)
	pixels.forEach(([r, g, b], index) => buffer.set([g, r, b], index * 3))
	return buffer
}

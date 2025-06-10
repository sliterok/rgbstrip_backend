import datagram from 'dgram'
import { dynamic } from './shared'
import { logger } from './logger'

export const socket = datagram.createSocket('udp4')
socket.on('error', e => logger.error(e))

export function startUdpServer() {
	try {
		socket.bind(8009, '0.0.0.0', () => {
			logger.info('up on 8009')
		})
	} catch (err) {
		logger.error(err)
	}
}

export const sendPacket = (buffer: Uint8Array) =>
	new Promise<number>((res, rej) =>
		socket.send(buffer, dynamic.target!.port, dynamic.target!.address, (err, bytes) => (err ? rej(err) : res(bytes)))
	)

let lastTimeout: NodeJS.Timeout
socket.on('message', (msg, newTarget) => {
	dynamic.lastMessage = Date.now()
	dynamic.target = newTarget

	clearTimeout(lastTimeout)
	lastTimeout = setTimeout(() => delete dynamic.target, 7000)
})

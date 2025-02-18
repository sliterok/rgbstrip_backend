import datagram from 'dgram'
import { dynamic } from './shared'

export const socket = datagram.createSocket('udp4')
socket.on('error', e => console.error(e))

export function startUdpServer() {
	try {
		socket.bind(8009, '0.0.0.0', () => {
			// eslint-disable-next-line no-console
			console.log('up on 8009')
		})
	} catch (err) {
		console.error(err)
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
	console.log('Ping from', newTarget)

	clearTimeout(lastTimeout)
	lastTimeout = setTimeout(() => delete dynamic.target, 7000)
})

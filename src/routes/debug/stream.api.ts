import { serverSentEvents, ServerSentEventSink } from '@hattip/response'
import { dynamic } from 'src/backend/shared'

const connections = new Set<ServerSentEventSink>()

export function get() {
	let thisSink: ServerSentEventSink

	if (import.meta.env.PROD) {
		console.warn('debug stream connection attempt rejected on prod')
		return
	}

	return serverSentEvents({
		onOpen(sink) {
			thisSink = sink
			connections.add(sink)
			sink.ping()
			dynamic.hasConnections = true
		},
		onClose() {
			connections.delete(thisSink)
			dynamic.hasConnections = connections.size !== 0
		},
	})
}

export function broadcastMessage(data: any) {
	for (const sink of connections) {
		sink.send({ data })
	}
}

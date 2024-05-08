import { serverSentEvents, ServerSentEventSink } from '@hattip/response'
import { dynamic } from 'src/backend/shared'

const connections = new Set<ServerSentEventSink>()

export function get() {
	let thisSink: ServerSentEventSink

	return serverSentEvents({
		onOpen(sink) {
			if (import.meta.env.PROD) return sink.close()
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

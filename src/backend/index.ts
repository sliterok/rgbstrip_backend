import { startTelegram } from './telegram'
import { startLoop } from './loop'
import { startRouterIntegration } from './router'
import { startUdpServer } from './udp'

// eslint-disable-next-line no-undef
process.env.TZ = '***REMOVED***'

let initted = false

export function init() {
	if (initted) return
	initted = true
	startLoop()
	startTelegram()
	startUdpServer()
	startRouterIntegration()
}

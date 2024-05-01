import { startTelegram } from './telegram'
import { startLoop } from './loop'
import { startRouterIntegration } from './router'
import { startUdpServer } from './udp'
import { config } from './config'
import { startNightChecks } from './night'

// eslint-disable-next-line no-undef
process.env.TZ = config.TZ

let initted = false

export function init() {
	if (initted) return
	initted = true
	startLoop()
	startNightChecks()
	startTelegram()
	startUdpServer()
	startRouterIntegration()
}

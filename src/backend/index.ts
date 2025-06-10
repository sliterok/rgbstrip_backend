import { startTelegram } from './telegram/bot'
import { startLoop } from './loop'
import { startRouterIntegration } from './router'
import { startUdpServer } from './udp'
import { config } from './config'
import { startNightChecks } from './night'

// eslint-disable-next-line no-undef
process.env.TZ = config.TZ

const g = globalThis as any

export function init() {
	if (g.__rgb_initted) return
	g.__rgb_initted = true
	startLoop()
	startNightChecks()
	startTelegram()
	startUdpServer()
	startRouterIntegration()
}

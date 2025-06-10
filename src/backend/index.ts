import { startTelegram } from './telegram/bot'
import { startLoop } from './loop'
import { startRouterIntegration } from './router'
import { startUdpServer } from './udp'
import { startAudioServer } from './audio'
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
	startAudioServer()
}

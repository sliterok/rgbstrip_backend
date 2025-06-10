import { settings } from '../settings'
import { logger } from './logger'

export function touchAlive() {
	settings.alive = new Date()
	logger.info('alive:', settings.alive)
}

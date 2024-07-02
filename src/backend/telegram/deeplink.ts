import crypto from 'crypto'
import { config } from '../config'

export function generateDeeplinkHash(username: string): string {
	return crypto
		.createHash('shake256', { outputLength: 48 })
		.update(username + config.tgApiKey)
		.digest('base64url')
}

import crypto from 'node:crypto'
import { config } from '../config'
import { isAllowedUser } from './auth'
import { logger } from '../../logger'

interface ITelegramProfile {
	allows_write_to_pm: true
	first_name: string
	id: number
	language_code: string
	last_name: string
	username: string
}

export function extractUserId(telegramInitData: string): number | null {
	try {
		const urlParams = new URLSearchParams(telegramInitData)
		const user = urlParams.get('user')
		if (!user) return null
		return (JSON.parse(user) as ITelegramProfile).id
	} catch (err) {
		logger.warn('failed to parse user id', err)
		return null
	}
}

export function isVerifiedUser(telegramInitData: string): boolean {
	const urlParams = new URLSearchParams(telegramInitData)

	const hash = urlParams.get('hash')
	urlParams.delete('hash')
	urlParams.sort()

	let dataCheckString = ''
	for (const [key, value] of urlParams.entries()) {
		dataCheckString += `${key}=${value}\n`
	}
	dataCheckString = dataCheckString.slice(0, -1)

	const secret = crypto.createHmac('sha256', 'WebAppData').update(config.tgApiKey).digest()
	const calculatedHash = crypto
		.createHmac('sha256', secret as unknown as crypto.BinaryLike)
		.update(dataCheckString)
		.digest('hex')

	if (calculatedHash !== hash) {
		logger.warn('invalid telegram signature')
		return false
	}

	const user = JSON.parse(urlParams.get('user')!) as ITelegramProfile
	const allowed = isAllowedUser(user.id)
	if (!allowed) logger.warn('user not allowed', { userId: user.id })
	return allowed
}

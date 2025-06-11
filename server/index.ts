import express, { Router } from 'express'
import { init } from '../src/backend'
import { logger } from '../src/logger'
import { settings } from '../src/settings'
import { isVerifiedUser, extractUserId } from '../src/backend/telegram/verify'
import { IArrColor } from '../src/typings'
import { streamHandler } from '../src/routes/debug/stream.api'

init()

const router = Router()
router.use(express.json())

router.get('/debug/stream', streamHandler)

router.get('/default-color', (req, res) => {
	const [r, g, b] = settings.color
	const a = settings.mixRatio
	res.json({ r, g, b, a })
})

router.post('/color', (req, res) => {
	const { color, alpha, tgWebAppData } = req.body as { color: IArrColor; alpha: number; tgWebAppData: string }
	if (!tgWebAppData) return res.status(400).end()
	if (!isVerifiedUser(tgWebAppData)) return res.status(403).end()
	const userId = extractUserId(tgWebAppData)
	settings.color = color
	settings.mixRatio = alpha
	logger.info('Color updated', { userId, color, alpha })
	res.status(204).end()
})

router.get('/alive', (req, res) => {
	settings.alive = new Date()
	logger.debug('alive', { time: settings.alive })
	res.send('ok')
})

export { router }

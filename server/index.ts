import express, { Router } from 'express'
import { init } from '../src/backend'
import { settings } from '../src/settings'
import { isVerifiedUser } from '../src/backend/telegram/verify'
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
	settings.color = color
	settings.mixRatio = alpha
	res.status(204).end()
})

router.get('/alive', (req, res) => {
	settings.alive = new Date()
	console.log('alive:', settings.alive)
	res.send('ok')
})

export { router }

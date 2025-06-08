import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { init } from '../src/backend'
import { settings } from '../src/settings'
import { isVerifiedUser } from '../src/backend/telegram/verify'
import { IArrColor } from '../src/typings'
import { streamHandler } from '../src/routes/debug/stream.api'

const app = express()
app.use(express.json())

init()

app.get('/debug/stream', streamHandler)

app.get('/api/default-color', (req, res) => {
	const [r, g, b] = settings.color
	const a = settings.mixRatio
	res.json({ r, g, b, a })
})

app.post('/api/color', (req, res) => {
	const { color, alpha, tgWebAppData } = req.body as { color: IArrColor; alpha: number; tgWebAppData: string }
	if (!tgWebAppData) return res.status(400).end()
	if (!isVerifiedUser(tgWebAppData)) return res.status(403).end()
	settings.color = color
	settings.mixRatio = alpha
	res.status(204).end()
})

app.get('/api/alive', (req, res) => {
	settings.alive = new Date()
	console.log('alive:', settings.alive)
	res.send('ok')
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname, '../client')))

const port = Number(process.env.PORT) || 8001
app.listen(port, () => {
	console.log('Server running on port', port)
})

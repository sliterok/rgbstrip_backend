import express from 'express'

const app = express()
app.use(express.json())
const router = express.Router()

export const settings = {
	mode: 5,
	progress: { current: 0, total: 0, lastUpdate: null },
	nightOverride: false,
	geoOverride: false,
	away: false,
	alive: new Date(),
}

router.get('/alive', (req, res) => {
	settings.alive = new Date()
	console.log('alive ping:', settings.alive)
	res.sendStatus(200)
})

router.get('/mode/:mode', (req, res) => {
	settings.mode = parseInt(req.params.mode) || 0
	res.status(200).send(settings)
})

router.post('/progress', (req, res) => {
	const [current, total] = req.body.progress.split('/').map(el => parseInt(el))
	settings.progress = { current, total, lastUpdate: Date.now() }
	res.sendStatus(200)
})

export function initExpress() {
	expressStarted = true
	const port = 8082

	app.use('/pixels', router)

	app.listen(port, function () {
		console.log('Example app listening on port ' + port + '!')
	})
}

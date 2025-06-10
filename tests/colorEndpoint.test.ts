import express, { type Router } from 'express'
import request from 'supertest'
import { jest } from '@jest/globals'

process.env.tgAllowedUsers = '0'
process.env.tgApiKey = '0:dummy'
process.env.TZ = 'UTC'

jest.mock('../src/backend', () => ({ init: () => {} }))

let router: Router
let app: express.Express

beforeAll(async () => {
	const mod = await import('../server')
	router = mod.router
	app = express()
	app.use(router)
})

describe('POST /color validation', () => {
	test('rejects invalid color array', async () => {
		await request(app)
			.post('/color')
			.send({ color: [256, 0, 0], alpha: 0.5 })
			.expect(400)
		await request(app)
			.post('/color')
			.send({ color: [0, 0], alpha: 0.5 })
			.expect(400)
	})

	test('rejects invalid alpha', async () => {
		await request(app)
			.post('/color')
			.send({ color: [0, 0, 0], alpha: -0.1 })
			.expect(400)
		await request(app)
			.post('/color')
			.send({ color: [0, 0, 0], alpha: 2 })
			.expect(400)
	})
})

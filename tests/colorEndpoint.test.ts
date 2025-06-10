import express from 'express'
import request from 'supertest'
import { jest } from '@jest/globals'

process.env.tgAllowedUsers = '0'

jest.mock('../src/backend', () => ({ init: () => {} }))

import { router } from '../server'

describe('POST /color validation', () => {
  const app = express()
  app.use(router)

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

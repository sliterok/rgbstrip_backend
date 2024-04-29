import { createMiddleware } from 'rakkasjs/node-adapter'
import './backend/startStrip.js'

export default createMiddleware(ctx => import('./entry-hattip').then(m => m.default(ctx)))

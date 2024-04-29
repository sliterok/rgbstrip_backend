import { createMiddleware } from 'rakkasjs/node-adapter'
import { init } from './backend'

init()

export default createMiddleware(ctx => import('./entry-hattip').then(m => m.default(ctx)))

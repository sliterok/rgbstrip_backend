import { defineConfig } from 'zenom'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const pathsPlugin = tsconfigPaths({ projects: ['../../tsconfig.json'] })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const alias = [
	{
		find: /^src\//,
		replacement: `${path.resolve(__dirname, 'src')}/`,
	},
]

export default defineConfig({
        root: './src',
	port: 8001,
	backendConfig: {
		plugins: [pathsPlugin],
		resolve: { alias },
	},
	frontendConfig: {
		plugins: [pathsPlugin],
		resolve: { alias },
	},
})

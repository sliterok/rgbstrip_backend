import { config as loadEnv } from 'dotenv'
import { IConfig } from 'src/typings'
const env = loadEnv().parsed || {}

export const config: IConfig = {
	...(env as Partial<IConfig>),
	...(process.env as Partial<IConfig>),
} as IConfig

const ConfigSchema = z.object({
	TZ: z.string().optional(),
	routerMac: z.string().nonempty(),
	routerDevice: z.string().nonempty(),
	routerEndpoint: z.string().nonempty(),
	tgAllowedUsers: z.string().nonempty(),
	tgApiKey: z.string().nonempty(),
	routerPassword: z.string().nonempty(),
	externalUrl: z.string().nonempty(),
})

const isTest = process.env.NODE_ENV === 'test'
const parsed = (isTest ? ConfigSchema.partial() : ConfigSchema).safeParse(process.env)

if (!parsed.success && !isTest) {
	const details = parsed.error.issues.map(issue => `${issue.path[0]}: ${issue.message}`).join(', ')
	throw new Error(`Invalid environment variables - ${details}`)
}

export const config: IConfig = (parsed.success ? parsed.data : process.env) as IConfig

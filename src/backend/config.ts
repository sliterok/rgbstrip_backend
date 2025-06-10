import { IConfig } from 'src/typings'
import { config as dotenv } from 'dotenv'
const env = dotenv().parsed || {}

	...(env as unknown as IConfig),
	...(process.env as unknown as Partial<IConfig>),

dotenv()

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

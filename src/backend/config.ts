import { IConfig } from 'src/typings'
import { config as dotenv } from 'dotenv'

export const config: IConfig = {
	...(dotenv().parsed as unknown as IConfig),
}

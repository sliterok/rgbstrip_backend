import { dynamic } from '../shared'

interface ICronTime {
	minutes: number
	hours: number
	time: number
}

export const nightUpdateTimes: ICronTime[] = []

function getTime(hours: number, minutes: number, store = false) {
	const time = hours + minutes / 60
	if (store) nightUpdateTimes.push({ minutes, hours, time })
	return time
}

const preWakeupTime = getTime(7, 30, true)
const wakeupTime = getTime(8, 50, true)
const sleepTime = getTime(23, 30, true)
const wakeupTimeWeekend = getTime(10, 0, true)
const sleepTimeWeekend = getTime(23, 45, true)

export function updateDisabledColor(time: number, targetSleepTime: number) {
	if (time >= preWakeupTime && time < targetSleepTime) {
		if (dynamic.disabledColor[1] !== 1) dynamic.disabledColor = [0, 1, 0]
	} else {
		if (dynamic.disabledColor[2] !== 1) dynamic.disabledColor = [0, 0, 1]
	}
}

export enum TargetTimes {
	sleep,
	wakeUp,
}

export enum WekeendDay {
	workday,
	friday,
	saturday,
	sunday,
}

export function getTargetTime(target: TargetTimes): number {
	const isWeekend = getIsWeekend()
	if (target === TargetTimes.wakeUp) {
		return isWeekend && isWeekend !== WekeendDay.friday ? wakeupTimeWeekend : wakeupTime
	} else if (target === TargetTimes.sleep) {
		return isWeekend && isWeekend !== WekeendDay.sunday ? sleepTimeWeekend : sleepTime
	}
	throw new Error(`unexpected target: ${target} in getTargetTime`)
}

const weekends = new Map([
	[5, WekeendDay.friday],
	[6, WekeendDay.saturday],
	[0, WekeendDay.sunday],
])

export function getIsWeekend() {
	const d = new Date()
	const day = d.getDay()
	const isWeekend = weekends.get(day)
	return isWeekend || WekeendDay.workday
}

export function getCurrentTime() {
	const d = new Date()
	const time = getTime(d.getHours(), d.getMinutes())

	return time
}

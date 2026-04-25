import { handle as coachHandle } from './coach.module.js'
import { handle as importHandle } from './import.module.js'

const modules = {
  coach: coachHandle,
  import: importHandle,
}

export function getModule(name) {
  return modules[name] || null
}

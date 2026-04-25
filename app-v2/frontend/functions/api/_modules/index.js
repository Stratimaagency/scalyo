import { handle as coach } from './coach.module.js'
import { handle as nova } from './nova.module.js'
import { handle as importMod } from './import.module.js'
import { handle as matrice } from './matrice.module.js'
import { handle as copil } from './copil.module.js'
import { handle as playbook } from './playbook.module.js'
import { handle as email } from './email.module.js'
import { handle as dashboard } from './dashboard.module.js'
import { handle as notif } from './notif.module.js'

const modules = { coach, nova, import: importMod, matrice, copil, playbook, email, dashboard, notif }

export function getModule(name) {
  return modules[name] || null
}

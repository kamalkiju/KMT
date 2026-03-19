import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { resolveNgrokExecutable } from './ngrok-bin.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const domain = process.env.NGROK_DOMAIN?.trim()
const args = ['http', '5177']
if (domain) {
  args.push('--domain', domain)
}

const bin = resolveNgrokExecutable(root) ?? 'ngrok'
const child = spawn(bin, args, { stdio: 'inherit' })
child.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0))
})

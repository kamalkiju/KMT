import { chmodSync, existsSync, mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import extract from 'extract-zip'
import {
  getNgrokCacheZipPath,
  getNgrokCdnUrl,
  resolveNgrokExecutable,
} from './ngrok-bin.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const nativeDir = join(root, '.ngrok-native')

async function extractCachedZipToNative() {
  let cdnUrl
  try {
    cdnUrl = getNgrokCdnUrl()
  } catch (e) {
    console.error(e.message)
    return false
  }
  const cacheZip = getNgrokCacheZipPath(cdnUrl)
  if (!existsSync(cacheZip)) {
    return false
  }
  mkdirSync(nativeDir, { recursive: true })
  try {
    await extract(cacheZip, { dir: nativeDir })
  } catch (e) {
    console.error('ngrok - extract from ~/.ngrok cache failed:', e.message)
    return false
  }
  const suffix = process.platform === 'win32' ? '.exe' : ''
  const target = join(nativeDir, 'ngrok' + suffix)
  if (!existsSync(target)) {
    console.error('ngrok - expected binary missing after extract:', target)
    return false
  }
  try {
    chmodSync(target, 0o755)
  } catch {
    /* windows */
  }
  console.error('ngrok - binary installed to', target, '(outside node_modules)')
  return true
}

if (resolveNgrokExecutable(root)) {
  process.exit(0)
}

if ((await extractCachedZipToNative()) && resolveNgrokExecutable(root)) {
  process.exit(0)
}

const postinstall = join(root, 'node_modules/ngrok/postinstall.js')
if (existsSync(postinstall)) {
  const r = spawnSync(process.execPath, [postinstall], { cwd: root, stdio: 'inherit' })
  if (r.status !== 0) {
    process.exit(r.status ?? 1)
  }
}

if ((await extractCachedZipToNative()) && resolveNgrokExecutable(root)) {
  process.exit(0)
}

if (resolveNgrokExecutable(root)) {
  process.exit(0)
}

console.error(`
ngrok binary not found. The npm postinstall may have been blocked (antivirus often removes
executables under node_modules).

Try:
  1) npm run ngrok:fetch   # downloads zip to ~/.ngrok/ — then re-run npm run dev:share
  2) brew install ngrok/ngrok/ngrok
`)
process.exit(1)

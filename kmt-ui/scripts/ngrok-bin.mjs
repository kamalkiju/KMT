import { existsSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

function isExecutableFile(p) {
  try {
    if (!existsSync(p)) return false
    const st = statSync(p)
    return st.isFile() && st.size > 10_000
  } catch {
    return false
  }
}

/** Prefer .ngrok-native (avoids AV deleting binaries under node_modules). */
export function resolveNgrokExecutable(root) {
  const win = process.platform === 'win32'
  const name = win ? 'ngrok.exe' : 'ngrok'
  const candidates = [join(root, '.ngrok-native', name), join(root, 'node_modules/ngrok/bin', name)]
  for (const p of candidates) {
    if (isExecutableFile(p)) return p
  }
  return null
}

export function getNgrokCdnUrl() {
  const { platform, arch } = process
  const base = 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-'
  const map = {
    'darwinarm64': 'darwin-arm64.zip',
    'darwinx64': 'darwin-amd64.zip',
    'linuxarm64': 'linux-arm64.zip',
    'linuxx64': 'linux-amd64.zip',
    'win32x64': 'windows-amd64.zip',
    'win32ia32': 'windows-386.zip',
  }
  const key = platform + arch
  const suffix = map[key]
  if (!suffix) {
    throw new Error(`ngrok: unsupported platform ${platform} ${arch}`)
  }
  return base + suffix
}

export function getNgrokCacheZipPath(cdnUrl) {
  const name = Buffer.from(cdnUrl).toString('base64')
  return join(homedir(), '.ngrok', `${name}.zip`)
}

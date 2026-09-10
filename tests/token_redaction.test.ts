import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// A base64 TP token containing characters that encodeURIComponent escapes
// ("+", "/", "="). Redaction that matches on the raw token value misses these
// once params() has encoded them into the URL.
const TOKEN = 'MTphYmMrZGVmL2doaQ=='
const BASE_URL = 'https://tp.example.com'

async function loadClient() {
  vi.resetModules()
  vi.stubEnv('TP_TOKEN', TOKEN)
  vi.stubEnv('TP_BASE_URL', BASE_URL)
  const { TpClient } = await import('../src/tp.js')
  return new TpClient()
}

function captureStderr() {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => { })
  return () => spy.mock.calls.flat().map((arg) => String(arg)).join('\n')
}

function expectNoToken(logged: string) {
  expect(logged).not.toContain(TOKEN)
  expect(logged).not.toContain(encodeURIComponent(TOKEN))
  expect(logged).toContain('access_token=***')
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('access token redaction in logs', () => {
  it('does not log the token on a successful GET', async () => {
    const tp = await loadClient()
    const logged = captureStderr()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ Items: [] }),
    }))

    await tp.getProjects()

    expectNoToken(logged())
  })

  it('does not log the token when a GET fails', async () => {
    const tp = await loadClient()
    const logged = captureStderr()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))

    await tp.getProjects()

    expectNoToken(logged())
  })

  it('does not log the token on a DELETE', async () => {
    const tp = await loadClient()
    const logged = captureStderr()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '{}',
    }))

    await tp.deleteCard({ id: '148980', type: 'Bug' })

    expectNoToken(logged())
  })

  it('does not log the token on a POST', async () => {
    const tp = await loadClient()
    const logged = captureStderr()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ Id: 1 }),
      text: async () => '{}',
    }))

    await tp.getUsers()
    await tp.setBusinessValue({ id: '148980', entityType: 'Bugs', priorityId: '1' })

    expectNoToken(logged())
  })

  it('redacts the token in the file-upload URL, which is not percent-encoded', async () => {
    const tp = await loadClient()
    const logged = captureStderr()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => 'ok',
    }))

    await tp.addAttachedFile('148980', { fileContent: 'aGk=', fileName: 'hi.txt' })

    expectNoToken(logged())
  })
})

import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { handleAddAttachment } from '../src/handlers/add_attachment.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  addAttachedFile: vi.fn(),
} as unknown as TpClient

const realFilePath = join(tmpdir(), 'add-attachment-test-fixture.png')

beforeAll(() => {
  writeFileSync(realFilePath, 'fake-image-bytes')
})

afterAll(() => {
  rmSync(realFilePath, { force: true })
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleAddAttachment', () => {
  it('uploads via filePath and returns a parsed JSON response', async () => {
    vi.mocked(mockTp.addAttachedFile).mockResolvedValue('{"Id":1,"Name":"screenshot.png"}')

    const result = await handleAddAttachment(mockTp, { cardId: '145789', filePath: realFilePath })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.uploaded).toBe(true)
    expect(parsed.response).toEqual({ Id: 1, Name: 'screenshot.png' })
    expect(mockTp.addAttachedFile).toHaveBeenCalledWith('145789', { filePath: realFilePath })
  })

  it('uploads via fileContent and fileName', async () => {
    vi.mocked(mockTp.addAttachedFile).mockResolvedValue('{"Id":2,"Name":"mockup.png"}')

    const result = await handleAddAttachment(mockTp, {
      cardId: '145789',
      fileContent: 'base64data',
      fileName: 'mockup.png',
    })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.uploaded).toBe(true)
    expect(mockTp.addAttachedFile).toHaveBeenCalledWith('145789', { fileContent: 'base64data', fileName: 'mockup.png' })
  })

  it('falls back to the raw response text when it is not JSON', async () => {
    vi.mocked(mockTp.addAttachedFile).mockResolvedValue('OK')

    const result = await handleAddAttachment(mockTp, { cardId: '145789', filePath: realFilePath })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.response).toBe('OK')
  })

  it('returns failure message when upload fails', async () => {
    vi.mocked(mockTp.addAttachedFile).mockResolvedValue(null)

    const result = await handleAddAttachment(mockTp, { cardId: '145789', filePath: realFilePath })

    expect(result.content[0].text).toContain('Failed to upload attachment to card id: 145789')
  })

  it('returns a validation message when neither filePath nor fileContent/fileName is provided', async () => {
    const result = await handleAddAttachment(mockTp, { cardId: '145789' })

    expect(result.content[0].text).toContain('Provide either filePath, or both fileContent and fileName')
    expect(mockTp.addAttachedFile).not.toHaveBeenCalled()
  })

  it('returns an actionable message instead of calling TP when filePath does not exist', async () => {
    const result = await handleAddAttachment(mockTp, { cardId: '145789', filePath: '/tmp/does-not-exist-12345.png' })

    expect(result.content[0].text).toContain('does not exist on this MCP server\'s filesystem')
    expect(result.content[0].text).toContain('fileContent')
    expect(mockTp.addAttachedFile).not.toHaveBeenCalled()
  })
})

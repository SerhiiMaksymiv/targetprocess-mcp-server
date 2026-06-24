import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetBugContent } from '../src/handlers/get_bug_content.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getBug: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetBugContent', () => {
  it('returns bug name and id', async () => {
    vi.mocked(mockTp.getBug).mockResolvedValue({
      Id: 145789,
      Name: 'Button is broken',
      Description: '<p>Some text</p>',
      CustomFields: [],
    } as any)

    const result = await handleGetBugContent(mockTp, '145789')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.id).toBe(145789)
    expect(parsed.name).toBe('Button is broken')
  })

  it('strips HTML tags from description', async () => {
    vi.mocked(mockTp.getBug).mockResolvedValue({
      Id: 1,
      Name: 'Bug',
      Description: '<h3>Steps</h3><ol><li>Click button</li><li>See error</li></ol>',
      CustomFields: [],
    } as any)

    const result = await handleGetBugContent(mockTp, '100001')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.description).not.toContain('<h3>')
    expect(parsed.description).not.toContain('<li>')
    expect(parsed.description).toContain('Click button')
    expect(parsed.description).toContain('See error')
  })

  it('returns failure message when bug is not found', async () => {
    vi.mocked(mockTp.getBug).mockResolvedValue(null as any)

    const result = await handleGetBugContent(mockTp, '145789')

    expect(result.content[0].text).toContain('Failed to get bug')
    expect(result.content[0].text).toContain('145789')
  })

  it('calls getBug with the provided id', async () => {
    vi.mocked(mockTp.getBug).mockResolvedValue({
      Id: 1, Name: 'B', Description: '', CustomFields: [],
    } as any)

    await handleGetBugContent(mockTp, '123456')

    expect(mockTp.getBug).toHaveBeenCalledWith('123456')
  })
})

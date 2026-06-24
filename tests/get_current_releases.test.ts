import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetCurrentReleases } from '../src/handlers/get_current_releases.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getCurrentReleases: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetCurrentReleases', () => {
  it('returns all release items as JSON', async () => {
    const mockReleases = [
      { Id: 10, Name: 'Release 1.0', IsCurrent: true },
      { Id: 11, Name: 'Release 1.1', IsCurrent: true },
    ]
    vi.mocked(mockTp.getCurrentReleases).mockResolvedValue({ Next: '', Items: mockReleases as any })

    const result = await handleGetCurrentReleases(mockTp)
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toHaveLength(2)
    expect(parsed[0].Name).toBe('Release 1.0')
    expect(parsed[1].Id).toBe(11)
  })

  it('returns failure message when request returns null', async () => {
    vi.mocked(mockTp.getCurrentReleases).mockResolvedValue(null as any)

    const result = await handleGetCurrentReleases(mockTp)

    expect(result.content[0].text).toContain('Failed to get current releases')
  })

  it('returns not found message when Items is empty', async () => {
    vi.mocked(mockTp.getCurrentReleases).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleGetCurrentReleases(mockTp)

    expect(result.content[0].text).toBe('No releases found')
  })
})

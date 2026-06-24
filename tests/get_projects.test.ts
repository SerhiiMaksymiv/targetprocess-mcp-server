import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetProjects } from '../src/handlers/get_projects.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getProjects: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetProjects', () => {
  it('returns mapped projects', async () => {
    vi.mocked(mockTp.getProjects).mockResolvedValue({
      Next: '',
      Items: [
        { Id: 1, Name: 'Project A' },
        { Id: 2, Name: 'Project B' },
      ] as any,
    })

    const result = await handleGetProjects(mockTp)
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toEqual([
      { id: 1, name: 'Project A' },
      { id: 2, name: 'Project B' },
    ])
  })

  it('returns failure message when request returns null', async () => {
    vi.mocked(mockTp.getProjects).mockResolvedValue(null as any)

    const result = await handleGetProjects(mockTp)

    expect(result.content[0].text).toContain('Failed to get projects')
  })

  it('returns not found message when Items is empty', async () => {
    vi.mocked(mockTp.getProjects).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleGetProjects(mockTp)

    expect(result.content[0].text).toBe('No projects found')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetReleaseUserStories } from '../src/handlers/get_release_user_stories.js'
import { handleGetReleaseBugs } from '../src/handlers/get_release_bugs.js'
import { handleGetReleaseFeatures } from '../src/handlers/get_release_features.js'
import { handleGetReleaseOpenBugs } from '../src/handlers/get_release_open_bugs.js'
import { handleGetReleaseOpenUserStories } from '../src/handlers/get_release_open_user_stories.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getReleaseUserStories: vi.fn(),
  getReleaseBugs: vi.fn(),
  getReleaseFeatures: vi.fn(),
  getReleaseOpenBugs: vi.fn(),
  getReleaseOpenUserStories: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetReleaseUserStories', () => {
  it('returns user stories as JSON', async () => {
    vi.mocked(mockTp.getReleaseUserStories).mockResolvedValue({
      Next: '',
      Items: [{ Id: 1, Name: 'US 1' }, { Id: 2, Name: 'US 2' }] as any,
    })

    const result = await handleGetReleaseUserStories(mockTp, 'v1.0')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toHaveLength(2)
    expect(parsed[0].Name).toBe('US 1')
  })

  it('returns failure when null', async () => {
    vi.mocked(mockTp.getReleaseUserStories).mockResolvedValue(null as any)

    const result = await handleGetReleaseUserStories(mockTp, 'v1.0')

    expect(result.content[0].text).toContain('Failed to get v1.0 release user stories')
  })

  it('returns not found when empty', async () => {
    vi.mocked(mockTp.getReleaseUserStories).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleGetReleaseUserStories(mockTp, 'v1.0')

    expect(result.content[0].text).toBe('No release user stories found')
  })

  it('passes withDescription flag to client', async () => {
    vi.mocked(mockTp.getReleaseUserStories).mockResolvedValue({
      Next: '', Items: [{ Id: 1, Name: 'US' }] as any,
    })

    await handleGetReleaseUserStories(mockTp, 'v1.0', 10, true)

    expect(mockTp.getReleaseUserStories).toHaveBeenCalledWith({ name: 'v1.0', results: 10, withDescription: true })
  })
})

describe('handleGetReleaseBugs', () => {
  it('returns bugs as JSON', async () => {
    vi.mocked(mockTp.getReleaseBugs).mockResolvedValue({
      Next: '',
      Items: [{ Id: 10, Name: 'Bug A' }, { Id: 11, Name: 'Bug B' }] as any,
    })

    const result = await handleGetReleaseBugs(mockTp, 'v1.0')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toHaveLength(2)
    expect(parsed[0].Name).toBe('Bug A')
  })

  it('returns failure when null', async () => {
    vi.mocked(mockTp.getReleaseBugs).mockResolvedValue(null as any)

    const result = await handleGetReleaseBugs(mockTp, 'v1.0')

    expect(result.content[0].text).toContain('Failed to get v1.0 release bugs')
  })

  it('returns not found when empty', async () => {
    vi.mocked(mockTp.getReleaseBugs).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleGetReleaseBugs(mockTp, 'v1.0')

    expect(result.content[0].text).toBe('No release bugs found')
  })
})

describe('handleGetReleaseFeatures', () => {
  it('returns features as JSON', async () => {
    vi.mocked(mockTp.getReleaseFeatures).mockResolvedValue({
      Next: '',
      Items: [{ Id: 20, Name: 'Feature X' }] as any,
    })

    const result = await handleGetReleaseFeatures(mockTp, 'v2.0')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed[0].Name).toBe('Feature X')
  })

  it('returns failure when null', async () => {
    vi.mocked(mockTp.getReleaseFeatures).mockResolvedValue(null as any)

    const result = await handleGetReleaseFeatures(mockTp, 'v2.0')

    expect(result.content[0].text).toContain('Failed to get v2.0 release features')
  })

  it('returns not found when empty', async () => {
    vi.mocked(mockTp.getReleaseFeatures).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleGetReleaseFeatures(mockTp, 'v2.0')

    expect(result.content[0].text).toBe('No release features found')
  })
})

describe('handleGetReleaseOpenBugs', () => {
  it('returns open bugs as JSON', async () => {
    vi.mocked(mockTp.getReleaseOpenBugs).mockResolvedValue({
      Next: '',
      Items: [{ Id: 30, Name: 'Open Bug' }] as any,
    })

    const result = await handleGetReleaseOpenBugs(mockTp, 'v1.0')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed[0].Name).toBe('Open Bug')
  })

  it('returns failure when null', async () => {
    vi.mocked(mockTp.getReleaseOpenBugs).mockResolvedValue(null as any)

    const result = await handleGetReleaseOpenBugs(mockTp, 'v1.0')

    expect(result.content[0].text).toContain('Failed to get v1.0 release bugs')
  })

  it('returns not found when empty', async () => {
    vi.mocked(mockTp.getReleaseOpenBugs).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleGetReleaseOpenBugs(mockTp, 'v1.0')

    expect(result.content[0].text).toBe('No release bugs found')
  })
})

describe('handleGetReleaseOpenUserStories', () => {
  it('returns open user stories as JSON', async () => {
    vi.mocked(mockTp.getReleaseOpenUserStories).mockResolvedValue({
      Next: '',
      Items: [{ Id: 40, Name: 'Open US' }] as any,
    })

    const result = await handleGetReleaseOpenUserStories(mockTp, 'v1.0')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed[0].Name).toBe('Open US')
  })

  it('returns failure when null', async () => {
    vi.mocked(mockTp.getReleaseOpenUserStories).mockResolvedValue(null as any)

    const result = await handleGetReleaseOpenUserStories(mockTp, 'v1.0')

    expect(result.content[0].text).toContain('Failed to get v1.0 release user stories')
  })

  it('returns not found when empty', async () => {
    vi.mocked(mockTp.getReleaseOpenUserStories).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleGetReleaseOpenUserStories(mockTp, 'v1.0')

    expect(result.content[0].text).toBe('No release user stories found')
  })
})

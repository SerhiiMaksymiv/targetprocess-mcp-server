import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetFeatureUserStories } from '../src/handlers/get_feature_user_stories.js'
import { handleGetUserStoryBugs } from '../src/handlers/get_user_story_bugs.js'
import { handleGetCardCurrentStatus } from '../src/handlers/get_card_current_status.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getFeatureUserStories: vi.fn(),
  getUserStoryBugs: vi.fn(),
  getCardStatus: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetFeatureUserStories', () => {
  it('returns user story items as JSON', async () => {
    vi.mocked(mockTp.getFeatureUserStories).mockResolvedValue({
      next: '',
      items: [{ items: [{ id: 1, name: 'US A' }, { id: 2, name: 'US B' }] }],
    } as any)

    const result = await handleGetFeatureUserStories(mockTp, '145636')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed[0].items[0].name).toBe('US A')
  })

  it('returns failure when null', async () => {
    vi.mocked(mockTp.getFeatureUserStories).mockResolvedValue(null as any)

    const result = await handleGetFeatureUserStories(mockTp, '145636')

    expect(result.content[0].text).toContain('Failed to get user stories for feature id: 145636')
  })

  it('returns not found when items is empty', async () => {
    vi.mocked(mockTp.getFeatureUserStories).mockResolvedValue({ next: '', items: [] } as any)

    const result = await handleGetFeatureUserStories(mockTp, '145636')

    expect(result.content[0].text).toContain('No user stories found in outer items for feature id: 145636')
  })

  it('calls getFeatureUserStories with the provided id', async () => {
    vi.mocked(mockTp.getFeatureUserStories).mockResolvedValue({ next: '', items: [{}] } as any)

    await handleGetFeatureUserStories(mockTp, '999999')

    expect(mockTp.getFeatureUserStories).toHaveBeenCalledWith('999999')
  })
})

describe('handleGetUserStoryBugs', () => {
  it('returns bug items as JSON', async () => {
    vi.mocked(mockTp.getUserStoryBugs).mockResolvedValue({
      next: '',
      items: [{ items: [{ id: 10, name: 'Bug X' }] }],
    } as any)

    const result = await handleGetUserStoryBugs(mockTp, '145789')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed[0].items[0].name).toBe('Bug X')
  })

  it('returns failure when null', async () => {
    vi.mocked(mockTp.getUserStoryBugs).mockResolvedValue(null as any)

    const result = await handleGetUserStoryBugs(mockTp, '145789')

    expect(result.content[0].text).toContain('Failed to get bugs for user story id: 145789')
  })

  it('returns not found when items is empty', async () => {
    vi.mocked(mockTp.getUserStoryBugs).mockResolvedValue({ next: '', items: [] } as any)

    const result = await handleGetUserStoryBugs(mockTp, '145789')

    expect(result.content[0].text).toContain('No bugs found for user story id: 145789')
  })
})

describe('handleGetCardCurrentStatus', () => {
  it('returns first status item as JSON', async () => {
    const mockStatus = {
      entityState: { id: 1, name: 'In Progress' },
      teamState: { id: 5, team: { id: 10, name: 'Alpha' } },
      teams: [],
    }
    vi.mocked(mockTp.getCardStatus).mockResolvedValue({ next: '', items: [mockStatus] } as any)

    const result = await handleGetCardCurrentStatus(mockTp, '145789')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.entityState.name).toBe('In Progress')
  })

  it('returns failure when null', async () => {
    vi.mocked(mockTp.getCardStatus).mockResolvedValue(null as any)

    const result = await handleGetCardCurrentStatus(mockTp, '145789')

    expect(result.content[0].text).toContain('Failed to get card status for UserStory id: 145789')
  })

  it('returns not found when items is empty', async () => {
    vi.mocked(mockTp.getCardStatus).mockResolvedValue({ next: '', items: [] } as any)

    const result = await handleGetCardCurrentStatus(mockTp, '145789')

    expect(result.content[0].text).toContain('No status data found for UserStory id: 145789')
  })

  it('uses Bug resource type when specified', async () => {
    vi.mocked(mockTp.getCardStatus).mockResolvedValue({ next: '', items: [{}] } as any)

    await handleGetCardCurrentStatus(mockTp, '100001', 'Bug')

    expect(mockTp.getCardStatus).toHaveBeenCalledWith('100001', 'Bug')
  })

  it('defaults to UserStory resource type', async () => {
    vi.mocked(mockTp.getCardStatus).mockResolvedValue({ next: '', items: [{}] } as any)

    await handleGetCardCurrentStatus(mockTp, '100002')

    expect(mockTp.getCardStatus).toHaveBeenCalledWith('100002', 'UserStory')
  })
})

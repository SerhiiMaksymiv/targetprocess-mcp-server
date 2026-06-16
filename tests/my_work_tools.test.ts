import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetInProgressTasksAndBugs } from '../src/handlers/get_in_progress_tasks_and_bugs.js'
import { handleListMyUserStories } from '../src/handlers/list_my_user_stories.js'
import { handleListMyBugs } from '../src/handlers/list_my_bugs.js'
import { handleLogTime } from '../src/handlers/log_time.js'
import { handleGetMyTimeLogs } from '../src/handlers/get_my_time_logs.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getInProgressTasksAndBugs: vi.fn(),
  getMyUserStories: vi.fn(),
  getMyBugs: vi.fn(),
  logTime: vi.fn(),
  getMyTimeLogs: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetInProgressTasksAndBugs', () => {
  it('returns mapped tasks and bugs', async () => {
    vi.mocked(mockTp.getInProgressTasksAndBugs).mockResolvedValue({
      tasks: [{ Id: 1, Name: 'Task A', EntityState: { Name: 'In Progress' }, UserStory: { Id: 10, Name: 'US', Feature: { Id: 5, Name: 'Feature' } } }],
      bugs: [{ Id: 2, Name: 'Bug B', EntityState: { Name: 'In Progress' }, UserStory: null, Feature: null }],
    } as any)

    const result = await handleGetInProgressTasksAndBugs(mockTp, '42')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toHaveLength(2)
    expect(parsed[0]).toMatchObject({ type: 'Task', id: 1, name: 'Task A', featureId: 5 })
    expect(parsed[1]).toMatchObject({ type: 'Bug', id: 2, name: 'Bug B' })
  })

  it('returns not found when both lists are empty', async () => {
    vi.mocked(mockTp.getInProgressTasksAndBugs).mockResolvedValue({ tasks: [], bugs: [] })

    const result = await handleGetInProgressTasksAndBugs(mockTp, '42')

    expect(result.content[0].text).toContain('No in-progress tasks or bugs found for user ID: 42')
  })

  it('uses bug.Feature as fallback when bug has no user story', async () => {
    vi.mocked(mockTp.getInProgressTasksAndBugs).mockResolvedValue({
      tasks: [],
      bugs: [{ Id: 3, Name: 'Standalone Bug', EntityState: { Name: 'In Progress' }, UserStory: null, Feature: { Id: 99, Name: 'Direct Feature' } }],
    } as any)

    const result = await handleGetInProgressTasksAndBugs(mockTp, '42')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed[0].featureId).toBe(99)
    expect(parsed[0].featureName).toBe('Direct Feature')
  })
})

describe('handleListMyUserStories', () => {
  it('returns user stories as JSON', async () => {
    vi.mocked(mockTp.getMyUserStories).mockResolvedValue({
      Next: '',
      Items: [{ Id: 1, Name: 'My Story' }, { Id: 2, Name: 'Another Story' }] as any,
    })

    const result = await handleListMyUserStories(mockTp, {})
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toHaveLength(2)
    expect(parsed[0].Name).toBe('My Story')
  })

  it('returns failure when null', async () => {
    vi.mocked(mockTp.getMyUserStories).mockResolvedValue(null as any)

    const result = await handleListMyUserStories(mockTp, {})

    expect(result.content[0].text).toContain('Failed to get user stories')
  })

  it('returns not found with state name in message when empty', async () => {
    vi.mocked(mockTp.getMyUserStories).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleListMyUserStories(mockTp, { state: 'In Progress' })

    expect(result.content[0].text).toContain('No user stories assigned to you with state "In Progress"')
  })

  it('returns generic not found when no state filter and empty', async () => {
    vi.mocked(mockTp.getMyUserStories).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleListMyUserStories(mockTp, {})

    expect(result.content[0].text).toBe('No user stories assigned to you')
  })
})

describe('handleListMyBugs', () => {
  it('returns bugs as JSON', async () => {
    vi.mocked(mockTp.getMyBugs).mockResolvedValue({
      Next: '',
      Items: [{ Id: 10, Name: 'My Bug' }] as any,
    })

    const result = await handleListMyBugs(mockTp, {})
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed[0].Name).toBe('My Bug')
  })

  it('returns failure when null', async () => {
    vi.mocked(mockTp.getMyBugs).mockResolvedValue(null as any)

    const result = await handleListMyBugs(mockTp, {})

    expect(result.content[0].text).toContain('Failed to get bugs')
  })

  it('returns not found with state name when empty and state provided', async () => {
    vi.mocked(mockTp.getMyBugs).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleListMyBugs(mockTp, { state: 'Done' })

    expect(result.content[0].text).toContain('No bugs assigned to you with state "Done"')
  })
})

describe('handleLogTime', () => {
  it('returns time log on success', async () => {
    vi.mocked(mockTp.logTime).mockResolvedValue({ Id: 1, Spent: 2 } as any)

    const result = await handleLogTime(mockTp, { entityId: '145789', entityType: 'Task', hours: 2 })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Spent).toBe(2)
  })

  it('returns failure when null', async () => {
    vi.mocked(mockTp.logTime).mockResolvedValue(null as any)

    const result = await handleLogTime(mockTp, { entityId: '145789', entityType: 'Bug', hours: 1.5 })

    expect(result.content[0].text).toContain('Failed to log time on Bug id: 145789')
  })

  it('calls logTime with all provided params', async () => {
    vi.mocked(mockTp.logTime).mockResolvedValue({ Id: 1 } as any)

    await handleLogTime(mockTp, {
      entityId: '100', entityType: 'UserStory', hours: 3, description: 'reviewed code', date: '2024-06-01',
    })

    expect(mockTp.logTime).toHaveBeenCalledWith({
      entityId: '100', entityType: 'UserStory', hours: 3, description: 'reviewed code', date: '2024-06-01',
    })
  })
})

describe('handleGetMyTimeLogs', () => {
  it('returns time logs as JSON', async () => {
    vi.mocked(mockTp.getMyTimeLogs).mockResolvedValue({
      Next: '',
      Items: [{ Id: 1, Spent: 1.5, Description: 'coding' }] as any,
    })

    const result = await handleGetMyTimeLogs(mockTp)
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed[0].Spent).toBe(1.5)
  })

  it('returns failure when null', async () => {
    vi.mocked(mockTp.getMyTimeLogs).mockResolvedValue(null as any)

    const result = await handleGetMyTimeLogs(mockTp)

    expect(result.content[0].text).toContain('Failed to get time logs')
  })

  it('returns not found when empty', async () => {
    vi.mocked(mockTp.getMyTimeLogs).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleGetMyTimeLogs(mockTp)

    expect(result.content[0].text).toBe('No time logs found')
  })
})

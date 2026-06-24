import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetCommitMessage } from '../src/handlers/get_commit_message.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getTask: vi.fn(),
  getBugWithRelations: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetCommitMessage — task', () => {
  it('formats message with feature prefix when task has feature', async () => {
    vi.mocked(mockTp.getTask).mockResolvedValue({
      Id: 200,
      Name: 'Fix login button',
      UserStory: { Id: 100, Name: 'Login', Feature: { Id: 50, Name: 'Auth' } },
    } as any)

    const result = await handleGetCommitMessage(mockTp, '200', 'task')

    expect(result.content[0].text).toBe('F#50 US#100 T#200 Fix login button')
  })

  it('formats message without feature prefix when task has no feature', async () => {
    vi.mocked(mockTp.getTask).mockResolvedValue({
      Id: 201,
      Name: 'Add tooltip',
      UserStory: { Id: 101, Name: 'Tooltip story', Feature: null },
    } as any)

    const result = await handleGetCommitMessage(mockTp, '201', 'task')

    expect(result.content[0].text).toBe('US#101 T#201 Add tooltip')
  })

  it('returns failure message when task is not found', async () => {
    vi.mocked(mockTp.getTask).mockResolvedValue(null as any)

    const result = await handleGetCommitMessage(mockTp, '999', 'task')

    expect(result.content[0].text).toContain('Failed to get task')
    expect(result.content[0].text).toContain('999')
  })

  it('returns failure message when task has no linked user story', async () => {
    vi.mocked(mockTp.getTask).mockResolvedValue({
      Id: 202,
      Name: 'Orphan task',
      UserStory: null,
    } as any)

    const result = await handleGetCommitMessage(mockTp, '202', 'task')

    expect(result.content[0].text).toContain('202')
    expect(result.content[0].text).toContain('no linked user story')
  })
})

describe('handleGetCommitMessage — bug', () => {
  it('formats message with feature prefix when bug has user story with feature', async () => {
    vi.mocked(mockTp.getBugWithRelations).mockResolvedValue({
      Id: 300,
      Name: 'Button crash',
      UserStory: { Id: 110, Name: 'Login', Feature: { Id: 60, Name: 'Auth' } },
      Feature: null,
    } as any)

    const result = await handleGetCommitMessage(mockTp, '300', 'bug')

    expect(result.content[0].text).toBe('F#60 US#110 B#300 Button crash')
  })

  it('formats message without feature prefix when bug user story has no feature', async () => {
    vi.mocked(mockTp.getBugWithRelations).mockResolvedValue({
      Id: 301,
      Name: 'Input lag',
      UserStory: { Id: 111, Name: 'Form story', Feature: null },
      Feature: null,
    } as any)

    const result = await handleGetCommitMessage(mockTp, '301', 'bug')

    expect(result.content[0].text).toBe('US#111 B#301 Input lag')
  })

  it('uses bug.Feature as fallback when user story has no feature', async () => {
    vi.mocked(mockTp.getBugWithRelations).mockResolvedValue({
      Id: 302,
      Name: 'Crash on save',
      UserStory: { Id: 112, Name: 'Save story', Feature: null },
      Feature: { Id: 70, Name: 'Save Feature' },
    } as any)

    const result = await handleGetCommitMessage(mockTp, '302', 'bug')

    expect(result.content[0].text).toBe('F#70 US#112 B#302 Crash on save')
  })

  it('formats standalone bug message when bug has no user story', async () => {
    vi.mocked(mockTp.getBugWithRelations).mockResolvedValue({
      Id: 303,
      Name: 'Standalone crash',
      UserStory: null,
      Feature: null,
    } as any)

    const result = await handleGetCommitMessage(mockTp, '303', 'bug')

    expect(result.content[0].text).toBe('B#303 Standalone crash')
  })

  it('returns failure message when bug is not found', async () => {
    vi.mocked(mockTp.getBugWithRelations).mockResolvedValue(null as any)

    const result = await handleGetCommitMessage(mockTp, '998', 'bug')

    expect(result.content[0].text).toContain('Failed to get bug')
    expect(result.content[0].text).toContain('998')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleCreateBug } from '../src/handlers/create_bug.js'
import { handleCreateUserStory } from '../src/handlers/create_user_story.js'
import { handleCreateFeature } from '../src/handlers/create_feature.js'
import { handleCreateTask } from '../src/handlers/create_task.js'
import { handleUpdateBug } from '../src/handlers/update_bug.js'
import { handleUpdateUserStorySubState } from '../src/handlers/update_user_story_sub_state.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  createBugOnly: vi.fn(),
  createUserStory: vi.fn(),
  createFeature: vi.fn(),
  createTask: vi.fn(),
  updateBug: vi.fn(),
  updateUserStorySubState: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleCreateBug', () => {
  it('returns created bug on success', async () => {
    vi.mocked(mockTp.createBugOnly).mockResolvedValue({ Id: 500, Name: 'Login fails' } as any)

    const result = await handleCreateBug(mockTp, { title: 'Login fails', bugContent: '<div>Steps...</div>' })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Id).toBe(500)
    expect(parsed.Name).toBe('Login fails')
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.createBugOnly).mockResolvedValue(null as any)

    const result = await handleCreateBug(mockTp, { title: 'Login fails', bugContent: '<div>Steps</div>' })

    expect(result.content[0].text).toContain('Failed to create bug "Login fails"')
  })

  it('calls createBugOnly with all params', async () => {
    vi.mocked(mockTp.createBugOnly).mockResolvedValue({ Id: 1 } as any)

    await handleCreateBug(mockTp, {
      title: 'Bug', bugContent: 'content', origin: 'Manual QA', projectId: '10', teamId: '20',
    })

    expect(mockTp.createBugOnly).toHaveBeenCalledWith({
      title: 'Bug', bugContent: 'content', origin: 'Manual QA', projectId: '10', teamId: '20',
    })
  })
})

describe('handleCreateUserStory', () => {
  it('returns created user story on success', async () => {
    vi.mocked(mockTp.createUserStory).mockResolvedValue({ Id: 600, Name: 'User can register' } as any)

    const result = await handleCreateUserStory(mockTp, { title: 'User can register' })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Id).toBe(600)
    expect(parsed.Name).toBe('User can register')
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.createUserStory).mockResolvedValue(null as any)

    const result = await handleCreateUserStory(mockTp, { title: 'Some story' })

    expect(result.content[0].text).toContain('Failed to create user story "Some story"')
  })

  it('passes optional fields to client', async () => {
    vi.mocked(mockTp.createUserStory).mockResolvedValue({ Id: 1 } as any)

    await handleCreateUserStory(mockTp, { title: 'Story', featureId: '123', releaseId: '456' })

    expect(mockTp.createUserStory).toHaveBeenCalledWith({
      title: 'Story', featureId: '123', releaseId: '456',
    })
  })
})

describe('handleCreateFeature', () => {
  it('returns created feature on success', async () => {
    vi.mocked(mockTp.createFeature).mockResolvedValue({ Id: 700, Name: 'Auth Module' } as any)

    const result = await handleCreateFeature(mockTp, { title: 'Auth Module' })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Id).toBe(700)
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.createFeature).mockResolvedValue(null as any)

    const result = await handleCreateFeature(mockTp, { title: 'Auth Module' })

    expect(result.content[0].text).toContain('Failed to create feature "Auth Module"')
  })
})

describe('handleCreateTask', () => {
  it('returns created task on success', async () => {
    vi.mocked(mockTp.createTask).mockResolvedValue({ Id: 800, Name: 'Write tests' } as any)

    const result = await handleCreateTask(mockTp, { title: 'Write tests', userStoryId: '145789' })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Id).toBe(800)
    expect(parsed.Name).toBe('Write tests')
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.createTask).mockResolvedValue(null as any)

    const result = await handleCreateTask(mockTp, { title: 'Write tests', userStoryId: '145789' })

    expect(result.content[0].text).toContain('Failed to create task "Write tests"')
  })

  it('calls createTask with title and userStoryId', async () => {
    vi.mocked(mockTp.createTask).mockResolvedValue({ Id: 1 } as any)

    await handleCreateTask(mockTp, { title: 'Do work', userStoryId: '145789', description: 'desc' })

    expect(mockTp.createTask).toHaveBeenCalledWith({ title: 'Do work', userStoryId: '145789', description: 'desc' })
  })
})

describe('handleUpdateBug', () => {
  it('returns updated bug on success', async () => {
    vi.mocked(mockTp.updateBug).mockResolvedValue({ Id: 100, Name: 'Fixed title' } as any)

    const result = await handleUpdateBug(mockTp, { id: '100', title: 'Fixed title' })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Id).toBe(100)
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.updateBug).mockResolvedValue(null as any)

    const result = await handleUpdateBug(mockTp, { id: '100', title: 'Fixed title' })

    expect(result.content[0].text).toContain('Failed to update bug')
  })

  it('passes all update fields to client', async () => {
    vi.mocked(mockTp.updateBug).mockResolvedValue({ Id: 1 } as any)

    await handleUpdateBug(mockTp, { id: '100', title: 'T', bugContent: 'B', entityStateId: '5' })

    expect(mockTp.updateBug).toHaveBeenCalledWith({ id: '100', title: 'T', bugContent: 'B', entityStateId: '5' })
  })
})

describe('handleUpdateUserStorySubState', () => {
  it('returns updated user story on success', async () => {
    vi.mocked(mockTp.updateUserStorySubState).mockResolvedValue({ Id: 145789, Name: 'My Story' } as any)

    const result = await handleUpdateUserStorySubState(mockTp, { id: '145789', entityStateId: '42' })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Id).toBe(145789)
    expect(parsed.Name).toBe('My Story')
  })

  it('returns failure message when response is null', async () => {
    vi.mocked(mockTp.updateUserStorySubState).mockResolvedValue(null as any)

    const result = await handleUpdateUserStorySubState(mockTp, { id: '145789' })

    expect(result.content[0].text).toContain('Failed to update user story sub state id: 145789')
  })

  it('calls updateUserStorySubState with all provided params', async () => {
    vi.mocked(mockTp.updateUserStorySubState).mockResolvedValue({ Id: 1 } as any)

    await handleUpdateUserStorySubState(mockTp, {
      id: '145789',
      teamId: '10',
      teamAssignmentId: '99',
      entityStateId: '42',
    })

    expect(mockTp.updateUserStorySubState).toHaveBeenCalledWith({
      id: '145789',
      teamId: '10',
      teamAssignmentId: '99',
      entityStateId: '42',
    })
  })
})

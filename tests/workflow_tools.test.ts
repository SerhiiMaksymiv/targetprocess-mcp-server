import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetProcesses } from '../src/handlers/get_processes.js'
import { handleGetProcessWorkflows } from '../src/handlers/get_process_workflows.js'
import { handleGetBugWorkflows } from '../src/handlers/get_bug_workflows.js'
import { handleGetUserStoryWorkflows } from '../src/handlers/get_user_story_workflows.js'
import { handleGetRelationTypes } from '../src/handlers/get_relation_types.js'
import { handleGetVersion } from '../src/handlers/get_version.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getProcesses: vi.fn(),
  getProcessWorkflows: vi.fn(),
  getBugWorkflows: vi.fn(),
  getUserStoryWorkflowsWithSubStates: vi.fn(),
  getRelationTypes: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetProcesses', () => {
  it('returns processes as JSON', async () => {
    vi.mocked(mockTp.getProcesses).mockResolvedValue({ next: '', items: [{ id: 1, name: 'Scrum' }] } as any)

    const result = await handleGetProcesses(mockTp)
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toEqual([{ id: 1, name: 'Scrum' }])
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.getProcesses).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleGetProcesses(mockTp)

    expect(result.content[0].text).toContain('Failed to get processes')
  })

  it('returns not found message when empty', async () => {
    vi.mocked(mockTp.getProcesses).mockResolvedValue({ next: '', items: [] } as any)

    const result = await handleGetProcesses(mockTp)

    expect(result.content[0].text).toContain('No processes found')
  })
})

describe('handleGetProcessWorkflows', () => {
  it('returns workflows for the process as JSON', async () => {
    vi.mocked(mockTp.getProcessWorkflows).mockResolvedValue({ next: '', items: [{ id: 1, name: 'Bug Workflow' }] } as any)

    const result = await handleGetProcessWorkflows(mockTp, '10')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toEqual([{ id: 1, name: 'Bug Workflow' }])
    expect(mockTp.getProcessWorkflows).toHaveBeenCalledWith({ processId: '10' })
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.getProcessWorkflows).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleGetProcessWorkflows(mockTp, '10')

    expect(result.content[0].text).toContain('Failed to get process workflows')
  })

  it('returns not found message when empty', async () => {
    vi.mocked(mockTp.getProcessWorkflows).mockResolvedValue({ next: '', items: [] } as any)

    const result = await handleGetProcessWorkflows(mockTp, '10')

    expect(result.content[0].text).toContain('No process workflows found')
  })
})

describe('handleGetBugWorkflows', () => {
  it('returns mapped bug workflows', async () => {
    vi.mocked(mockTp.getBugWorkflows).mockResolvedValue({
      next: '',
      items: [{
        id: 1,
        name: 'Bug Workflow',
        process: 'Scrum',
        entityType: 'Bug',
        entityStates: [{ id: 10, name: 'Open' }],
      }],
    } as any)

    const result = await handleGetBugWorkflows(mockTp)
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toEqual([{
      id: 1,
      name: 'Bug Workflow',
      processId: 'Scrum',
      entityType: 'Bug',
      entityStates: [{ id: 10, name: 'Open' }],
    }])
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.getBugWorkflows).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleGetBugWorkflows(mockTp)

    expect(result.content[0].text).toContain('Failed to get bug entity statuses')
  })

  it('returns not found message when empty', async () => {
    vi.mocked(mockTp.getBugWorkflows).mockResolvedValue({ next: '', items: [] } as any)

    const result = await handleGetBugWorkflows(mockTp)

    expect(result.content[0].text).toContain('No status data found for workflows')
  })
})

describe('handleGetUserStoryWorkflows', () => {
  it('returns only UserStory workflows, mapped with sub-states', async () => {
    vi.mocked(mockTp.getUserStoryWorkflowsWithSubStates).mockResolvedValue({
      next: '',
      items: [
        {
          id: 1,
          workflow: { process: { id: 5 } },
          entityType: { name: 'UserStory' },
          subEntityStates: [{ id: 10, name: 'In Progress' }],
        },
        {
          id: 2,
          workflow: { process: { id: 5 } },
          entityType: { name: 'Bug' },
          subEntityStates: [{ id: 20, name: 'Open' }],
        },
      ],
    } as any)

    const result = await handleGetUserStoryWorkflows(mockTp)
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toEqual([{
      id: 1,
      processId: 5,
      entityType: 'UserStory',
      entityStates: [{ id: 10, name: 'In Progress' }],
    }])
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.getUserStoryWorkflowsWithSubStates).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleGetUserStoryWorkflows(mockTp)

    expect(result.content[0].text).toContain('Failed to get user story entity statuses')
  })

  it('returns not found message when empty', async () => {
    vi.mocked(mockTp.getUserStoryWorkflowsWithSubStates).mockResolvedValue({ next: '', items: [] } as any)

    const result = await handleGetUserStoryWorkflows(mockTp)

    expect(result.content[0].text).toContain('No status data found for workflows')
  })
})

describe('handleGetRelationTypes', () => {
  it('returns mapped relation types', async () => {
    vi.mocked(mockTp.getRelationTypes).mockResolvedValue({
      Items: [{ Id: 10, Name: 'Depends on' }, { Id: 20, Name: 'Relate to' }],
    } as any)

    const result = await handleGetRelationTypes(mockTp)
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toEqual([{ id: 10, name: 'Depends on' }, { id: 20, name: 'Relate to' }])
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.getRelationTypes).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleGetRelationTypes(mockTp)

    expect(result.content[0].text).toContain('Failed to get relation types')
  })
})

describe('handleGetVersion', () => {
  it('returns the provided version string', async () => {
    const result = await handleGetVersion('2.5.3')

    expect(result.content[0].text).toBe('2.5.3')
  })
})

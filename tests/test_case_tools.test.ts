import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetTestCaseById } from '../src/handlers/get_test_case_by_id.js'
import { handleUpdateTestCaseById } from '../src/handlers/update_test_case_by_id.js'
import { handleAddTestCaseStepById } from '../src/handlers/add_test_case_step_by_id.js'
import { handleUpdateTestCaseStepById } from '../src/handlers/update_test_case_step_by_id.js'
import { handleDeleteTestCaseStepById } from '../src/handlers/delete_test_case_step_by_id.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getTestCase: vi.fn(),
  getTestCaseSteps: vi.fn(),
  updateTestCase: vi.fn(),
  addTestStep: vi.fn(),
  getTestStep: vi.fn(),
  updateTestStep: vi.fn(),
  deleteTestStep: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetTestCaseById', () => {
  it('returns test case with stripped description and steps', async () => {
    vi.mocked(mockTp.getTestCase).mockResolvedValue({
      Id: 145789,
      Name: 'TC Login',
      Description: '<p>Preconditions</p>',
      LinkedTestPlan: { Name: 'Login Test Plan' },
    } as any)
    vi.mocked(mockTp.getTestCaseSteps).mockResolvedValue({
      Items: [{ Description: 'Open login page', Result: 'Page loads', RunOrder: 1 }],
    } as any)

    const result = await handleGetTestCaseById(mockTp, '145789')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.id).toBe(145789)
    expect(parsed.description).toBe('Preconditions')
    expect(parsed.testPlan).toBe('Login Test Plan')
    expect(parsed.steps).toEqual([{ description: 'Open login page', result: 'Page loads', runOrder: 1 }])
  })

  it('returns failure message when test case is not found', async () => {
    vi.mocked(mockTp.getTestCase).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleGetTestCaseById(mockTp, '145789')

    expect(result.content[0].text).toContain('Failed to get test case id: 145789')
  })
})

describe('handleUpdateTestCaseById', () => {
  it('returns updated test case on success', async () => {
    vi.mocked(mockTp.updateTestCase).mockResolvedValue({ Id: 145789, Name: 'Updated name' } as any)

    const result = await handleUpdateTestCaseById(mockTp, { id: '145789', name: 'Updated name' })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Name).toBe('Updated name')
    expect(mockTp.updateTestCase).toHaveBeenCalledWith({ id: '145789', name: 'Updated name' })
  })

  it('returns message when nothing to update', async () => {
    const result = await handleUpdateTestCaseById(mockTp, { id: '145789' })

    expect(result.content[0].text).toContain('Nothing to update for test case id: 145789')
    expect(mockTp.updateTestCase).not.toHaveBeenCalled()
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.updateTestCase).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleUpdateTestCaseById(mockTp, { id: '145789', description: 'New desc' })

    expect(result.content[0].text).toContain('Failed to update test case id: 145789')
  })
})

describe('handleAddTestCaseStepById', () => {
  it('returns created step on success', async () => {
    vi.mocked(mockTp.addTestStep).mockResolvedValue({ Id: 1, Description: 'Click login', Result: 'Logged in' } as any)

    const result = await handleAddTestCaseStepById(mockTp, { testCaseId: '145789', description: 'Click login', result: 'Logged in' })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Id).toBe(1)
    expect(mockTp.addTestStep).toHaveBeenCalledWith('145789', { description: 'Click login', result: 'Logged in' })
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.addTestStep).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleAddTestCaseStepById(mockTp, { testCaseId: '145789', description: 'Click login', result: 'Logged in' })

    expect(result.content[0].text).toContain('Failed to add test step to test case id: 145789')
  })
})

describe('handleUpdateTestCaseStepById', () => {
  it('merges with existing step fields and updates', async () => {
    vi.mocked(mockTp.getTestStep).mockResolvedValue({ Id: 1, Description: 'Old desc', Result: 'Old result' } as any)
    vi.mocked(mockTp.updateTestStep).mockResolvedValue({ Id: 1, Description: 'New desc', Result: 'Old result' } as any)

    const result = await handleUpdateTestCaseStepById(mockTp, { id: '1', description: 'New desc' })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Description).toBe('New desc')
    expect(mockTp.updateTestStep).toHaveBeenCalledWith({ id: '1', description: 'New desc', result: 'Old result' })
  })

  it('returns message when nothing to update', async () => {
    const result = await handleUpdateTestCaseStepById(mockTp, { id: '1' })

    expect(result.content[0].text).toContain('Nothing to update for test step id: 1')
    expect(mockTp.getTestStep).not.toHaveBeenCalled()
  })

  it('returns failure message when existing step is not found', async () => {
    vi.mocked(mockTp.getTestStep).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleUpdateTestCaseStepById(mockTp, { id: '1', description: 'New desc' })

    expect(result.content[0].text).toContain('Failed to get test step id: 1')
    expect(mockTp.updateTestStep).not.toHaveBeenCalled()
  })
})

describe('handleDeleteTestCaseStepById', () => {
  it('returns deleted confirmation on success', async () => {
    vi.mocked(mockTp.deleteTestStep).mockResolvedValue({ ok: true, data: { Id: 1 } } as any)

    const result = await handleDeleteTestCaseStepById(mockTp, '1')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.deleted).toBe(true)
    expect(parsed.testStepId).toBe(1)
  })

  it('surfaces HTTP status and response body on failure', async () => {
    vi.mocked(mockTp.deleteTestStep).mockResolvedValue({
      ok: false,
      status: 404,
      body: '{"Message":"Test step not found"}',
    } as any)

    const result = await handleDeleteTestCaseStepById(mockTp, '999')

    expect(result.content[0].text).toContain('Failed to delete test step id: 999')
    expect(result.content[0].text).toContain('HTTP status: 404')
    expect(result.content[0].text).toContain('Test step not found')
  })
})

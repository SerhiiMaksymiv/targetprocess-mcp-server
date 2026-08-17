import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetTestPlanById } from '../src/handlers/get_test_plan_by_id.js'
import { handleGetTestPlanTestCasesById } from '../src/handlers/get_test_plan_test_cases_by_id.js'
import { handleGetTestPlanTestCasesWithStepsById } from '../src/handlers/get_test_plan_test_cases_with_steps_by_id.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getTestPlan: vi.fn(),
  getIndirectTestPlanTestCases: vi.fn(),
  getTestPlanTestCases: vi.fn(),
  getTestCaseSteps: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetTestPlanById', () => {
  it('returns test plan details with stripped description', async () => {
    vi.mocked(mockTp.getTestPlan).mockResolvedValue({
      Id: 145789,
      Name: 'Login Test Plan',
      Description: '<p>Covers <b>login</b> flows</p>',
      EntityState: { Name: 'Open' },
      Project: { Name: 'Project A' },
      LinkedUserStory: { Name: 'US Login' },
      LinkedAssignable: { Name: 'US Login' },
      CreateDate: '2026-01-01',
      ModifyDate: '2026-01-02',
    } as any)

    const result = await handleGetTestPlanById(mockTp, '145789')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.id).toBe(145789)
    expect(parsed.name).toBe('Login Test Plan')
    expect(parsed.description).toBe('Covers login flows')
    expect(parsed.entityState).toBe('Open')
    expect(parsed.linkedUserStory).toBe('US Login')
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.getTestPlan).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleGetTestPlanById(mockTp, '145789')

    expect(result.content[0].text).toContain('Failed to get test plan id: 145789')
  })
})

describe('handleGetTestPlanTestCasesById', () => {
  it('returns mapped test cases with stripped descriptions', async () => {
    vi.mocked(mockTp.getIndirectTestPlanTestCases).mockResolvedValue({
      Items: [
        { Id: 1, Name: 'TC1', Description: '<p>Step text</p>', TestPlanId: 145789, TestPlanName: 'Login Test Plan' },
      ],
    } as any)

    const result = await handleGetTestPlanTestCasesById(mockTp, '145789')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toHaveLength(1)
    expect(parsed[0].description).toBe('Step text')
    expect(parsed[0].testPlanName).toBe('Login Test Plan')
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.getIndirectTestPlanTestCases).mockResolvedValue(null as any)

    const result = await handleGetTestPlanTestCasesById(mockTp, '145789')

    expect(result.content[0].text).toContain('Failed to get test cases for test plan id: 145789')
  })

  it('returns not found message when empty', async () => {
    vi.mocked(mockTp.getIndirectTestPlanTestCases).mockResolvedValue({ Items: [] } as any)

    const result = await handleGetTestPlanTestCasesById(mockTp, '145789')

    expect(result.content[0].text).toContain('No test cases found for test plan id: 145789')
  })
})

describe('handleGetTestPlanTestCasesWithStepsById', () => {
  it('returns test cases with their steps', async () => {
    vi.mocked(mockTp.getTestPlanTestCases).mockResolvedValue({
      Items: [{ Id: 1, Name: 'TC1', Description: '<p>Desc</p>', TestPlanId: 145789, TestPlanName: 'Plan A' }],
    } as any)
    vi.mocked(mockTp.getTestCaseSteps).mockResolvedValue({
      Items: [{ Description: 'Click login', Result: 'User is logged in', RunOrder: 1 }],
    } as any)

    const result = await handleGetTestPlanTestCasesWithStepsById(mockTp, '145789')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toHaveLength(1)
    expect(parsed[0].testCaseDescription).toBe('Desc')
    expect(parsed[0].testCaseSteps).toEqual([{ description: 'Click login', result: 'User is logged in', runOrder: 1 }])
    expect(mockTp.getTestCaseSteps).toHaveBeenCalledWith('1')
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.getTestPlanTestCases).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleGetTestPlanTestCasesWithStepsById(mockTp, '145789')

    expect(result.content[0].text).toContain('Failed to get test cases for test plan id: 145789')
  })

  it('returns not found message when empty', async () => {
    vi.mocked(mockTp.getTestPlanTestCases).mockResolvedValue({ Items: [] } as any)

    const result = await handleGetTestPlanTestCasesWithStepsById(mockTp, '145789')

    expect(result.content[0].text).toContain('No test cases found for test plan id: 145789')
  })
})

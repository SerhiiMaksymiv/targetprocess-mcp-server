import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TpClient } from '../src/tp.js'
import { handleGetTestPlanById } from '../src/handlers/get_test_plan_by_id.js'
import { handleGetTestPlanTestCasesById } from '../src/handlers/get_test_plan_test_cases_by_id.js'
import { handleGetTestPlanTestCasesWithStepsById } from '../src/handlers/get_test_plan_test_cases_with_steps_by_id.js'
import { handleGetTestCaseById } from '../src/handlers/get_test_case_by_id.js'

const mockTp = {
  getTestPlan: vi.fn(),
  getTestPlanTestCases: vi.fn(),
  getTestCase: vi.fn(),
  getTestCaseSteps: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('handleGetTestPlanById', () => {
  it('returns normalized test plan data', async () => {
    vi.mocked(mockTp.getTestPlan).mockResolvedValue({
      Id: 145789,
      Name: 'Regression test plan',
      Description: '<p>Coverage for login</p>',
      EntityState: { Name: 'Open' },
      Project: { Name: 'Payments' },
      LinkedUserStory: { Name: 'User can sign in' },
      LinkedAssignable: { Name: 'Authentication' },
      CreateDate: '2026-01-01T00:00:00Z',
      ModifyDate: '2026-01-02T00:00:00Z',
    } as any)

    const result = await handleGetTestPlanById(mockTp, '145789')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toEqual({
      id: 145789,
      name: 'Regression test plan',
      description: 'Coverage for login',
      entityState: 'Open',
      project: 'Payments',
      linkedUserStory: 'User can sign in',
      linkedAssignable: 'Authentication',
      createDate: '2026-01-01T00:00:00Z',
      modifyDate: '2026-01-02T00:00:00Z',
    })
  })

  it('returns failure message when test plan is not found', async () => {
    vi.mocked(mockTp.getTestPlan).mockResolvedValue(null as any)

    const result = await handleGetTestPlanById(mockTp, '145789')

    expect(result.content[0].text).toContain('Failed to get test plan id: 145789')
  })

  it('calls getTestPlan with the provided id', async () => {
    vi.mocked(mockTp.getTestPlan).mockResolvedValue({ Id: 1, Name: 'Plan' } as any)

    await handleGetTestPlanById(mockTp, '145789')

    expect(mockTp.getTestPlan).toHaveBeenCalledWith('145789')
  })
})

describe('handleGetTestPlanTestCasesById', () => {
  it('returns normalized test cases without steps', async () => {
    vi.mocked(mockTp.getTestPlanTestCases).mockResolvedValue({
      Items: [
        { Id: 1, Name: 'Happy path', Description: '<div>Can complete checkout</div>', TestPlanId: 145789, TestPlanName: 'Root plan' },
        { Id: 2, Name: 'Validation', Description: '<p>Shows required field errors</p>', TestPlanId: 145790, TestPlanName: 'Child plan' },
      ],
    } as any)

    const result = await handleGetTestPlanTestCasesById(mockTp, '145789')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toEqual([
      { id: 1, name: 'Happy path', description: 'Can complete checkout', testPlanId: 145789, testPlanName: 'Root plan' },
      { id: 2, name: 'Validation', description: 'Shows required field errors', testPlanId: 145790, testPlanName: 'Child plan' },
    ])
  })

  it('returns failure message when test cases response is missing', async () => {
    vi.mocked(mockTp.getTestPlanTestCases).mockResolvedValue(null as any)

    const result = await handleGetTestPlanTestCasesById(mockTp, '145789')

    expect(result.content[0].text).toContain('Failed to get test cases for test plan id: 145789')
  })

  it('returns empty-list message when there are no test cases', async () => {
    vi.mocked(mockTp.getTestPlanTestCases).mockResolvedValue({ Items: [] } as any)

    const result = await handleGetTestPlanTestCasesById(mockTp, '145789')

    expect(result.content[0].text).toContain('No test cases found for test plan id: 145789')
  })

  it('calls getTestPlanTestCases with the provided id', async () => {
    vi.mocked(mockTp.getTestPlanTestCases).mockResolvedValue({ Items: [] } as any)

    await handleGetTestPlanTestCasesById(mockTp, '145789')

    expect(mockTp.getTestPlanTestCases).toHaveBeenCalledWith('145789')
  })
})

describe('handleGetTestPlanTestCasesWithStepsById', () => {
  it('returns normalized nested test cases with steps and containing test plan data', async () => {
    vi.mocked(mockTp.getTestPlanTestCases).mockResolvedValue({
      Items: [
        { Id: 304953, Name: 'Nested case', Description: '<div>Nested preconditions</div>', TestPlanId: 304449, TestPlanName: 'Child plan' },
      ],
    } as any)
    vi.mocked(mockTp.getTestCaseSteps).mockResolvedValue({
      Items: [
        { Description: 'Login', Result: 'User is logged in', RunOrder: 1 },
      ],
    } as any)

    const result = await handleGetTestPlanTestCasesWithStepsById(mockTp, '304077')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toEqual([
      {
        testCaseId: 304953,
        testCaseName: 'Nested case',
        testCaseDescription: 'Nested preconditions',
        testPlanId: 304449,
        testPlanName: 'Child plan',
        testCaseSteps: [
          { description: 'Login', result: 'User is logged in', runOrder: 1 },
        ],
      },
    ])
  })
})

describe('handleGetTestCaseById', () => {
  it('returns normalized test case data with steps', async () => {
    vi.mocked(mockTp.getTestCase).mockResolvedValue({
      Id: 987654,
      Name: 'Checkout succeeds',
      Description: '<p>Preconditions: cart has items</p>',
      TestPlans: { Items: [{ ResourceType: 'TestPlan', Id: 111, Name: 'Checkout plan' }] },
    } as any)
    vi.mocked(mockTp.getTestCaseSteps).mockResolvedValue({
      Items: [
        { Description: 'Open cart', Result: 'Cart opens', RunOrder: 1 },
        { Description: 'Submit payment', Result: 'Order is created', RunOrder: 2 },
      ],
    } as any)

    const result = await handleGetTestCaseById(mockTp, '987654')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toEqual({
      id: 987654,
      name: 'Checkout succeeds',
      description: 'Preconditions: cart has items',
      testPlan: 'Checkout plan',
      steps: [
        { description: 'Open cart', result: 'Cart opens', runOrder: 1 },
        { description: 'Submit payment', result: 'Order is created', runOrder: 2 },
      ],
    })
  })

  it('returns failure message when test case is not found', async () => {
    vi.mocked(mockTp.getTestCase).mockResolvedValue(null as any)

    const result = await handleGetTestCaseById(mockTp, '987654')

    expect(result.content[0].text).toContain('Failed to get test case id: 987654')
    expect(mockTp.getTestCaseSteps).not.toHaveBeenCalled()
  })

  it('calls getTestCase and getTestCaseSteps with the expected ids', async () => {
    vi.mocked(mockTp.getTestCase).mockResolvedValue({
      Id: 987654,
      Name: 'Checkout succeeds',
      Description: '',
    } as any)
    vi.mocked(mockTp.getTestCaseSteps).mockResolvedValue({ Items: [] } as any)

    await handleGetTestCaseById(mockTp, '123456')

    expect(mockTp.getTestCase).toHaveBeenCalledWith('123456')
    expect(mockTp.getTestCaseSteps).toHaveBeenCalledWith('987654')
  })
})

describe('TpClient.getTestPlanTestCases', () => {
  const jsonResponse = (body: unknown) => new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })

  it('returns test cases from nested child test plans', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const decodedUrl = decodeURIComponent(url)

      if (decodedUrl.includes('/testPlans/304077/testcases/')) {
        return jsonResponse({ Next: '', Items: [] })
      }

      if (decodedUrl.includes('/testPlans/304449/testcases/')) {
        return jsonResponse({
          Next: '',
          Items: [{ Id: 304953, Name: 'Nested case', Description: '<p>Nested</p>' }],
        })
      }

      if (decodedUrl.includes('/testPlans/304950/testcases/')) {
        return jsonResponse({
          Next: '',
          Items: [{ Id: 304954, Name: 'Grandchild case', Description: '<p>Grandchild</p>' }],
        })
      }

      if (decodedUrl.includes('/testPlans/?') && decodedUrl.includes('ParentTestPlans.Id eq 304077')) {
        return jsonResponse({ Next: '', Items: [{ Id: 304449, Name: 'Child plan' }] })
      }

      if (decodedUrl.includes('/testPlans/?') && decodedUrl.includes('ParentTestPlans.Id eq 304449')) {
        return jsonResponse({ Next: '', Items: [{ Id: 304950, Name: 'Grandchild plan' }] })
      }

      if (decodedUrl.includes('/testPlans/?') && decodedUrl.includes('ParentTestPlans.Id eq 304950')) {
        return jsonResponse({ Next: '', Items: [] })
      }

      if (decodedUrl.includes('/testPlans/304077/')) {
        return jsonResponse({ Id: 304077, Name: 'Root plan' })
      }

      throw new Error(`Unexpected URL: ${decodedUrl}`)
    }))

    const tp = new TpClient()
    const response = await tp.getTestPlanTestCases<{ Items: Array<{ Id: number, TestPlanId?: number, TestPlanName?: string }> }>('304077')

    expect(response.Items).toEqual([
      { Id: 304953, Name: 'Nested case', Description: '<p>Nested</p>', TestPlanId: 304449, TestPlanName: 'Child plan' },
      { Id: 304954, Name: 'Grandchild case', Description: '<p>Grandchild</p>', TestPlanId: 304950, TestPlanName: 'Grandchild plan' },
    ])
  })

  it('deduplicates test cases and does not loop on repeated child plans', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const decodedUrl = decodeURIComponent(url)

      if (decodedUrl.includes('/testPlans/304077/testcases/')) {
        return jsonResponse({
          Next: '',
          Items: [{ Id: 304953, Name: 'Root copy', Description: '' }],
        })
      }

      if (decodedUrl.includes('/testPlans/304449/testcases/')) {
        return jsonResponse({
          Next: '',
          Items: [{ Id: 304953, Name: 'Child copy', Description: '' }],
        })
      }

      if (decodedUrl.includes('/testPlans/?') && decodedUrl.includes('ParentTestPlans.Id eq 304077')) {
        return jsonResponse({ Next: '', Items: [{ Id: 304449, Name: 'Child plan' }] })
      }

      if (decodedUrl.includes('/testPlans/?') && decodedUrl.includes('ParentTestPlans.Id eq 304449')) {
        return jsonResponse({ Next: '', Items: [{ Id: 304077, Name: 'Root plan' }] })
      }

      if (decodedUrl.includes('/testPlans/304077/')) {
        return jsonResponse({ Id: 304077, Name: 'Root plan' })
      }

      throw new Error(`Unexpected URL: ${decodedUrl}`)
    }))

    const tp = new TpClient()
    const response = await tp.getTestPlanTestCases<{ Items: Array<{ Id: number, Name: string }> }>('304077')

    expect(response.Items).toEqual([
      { Id: 304953, Name: 'Root copy', Description: '', TestPlanId: 304077, TestPlanName: 'Root plan' },
    ])
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleCreateFormattedUserStory } from '../src/handlers/create_formatted_user_story.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  createUserStory: vi.fn(),
} as unknown as TpClient

const baseParams = {
  title: 'Login with SSO',
  header: { asA: 'user', iWant: 'to log in with SSO', soThat: 'I save time provisioning accounts' },
  scenarios: [{ name: 'Successful SSO login', steps: ['Given I am on the login page', 'When I click "Login with SSO"', 'Then I am redirected to the dashboard'] }],
  acceptanceCriteria: ['User can log in via SSO and lands on the dashboard'],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleCreateFormattedUserStory', () => {
  it('returns created user story on success', async () => {
    vi.mocked(mockTp.createUserStory).mockResolvedValue({ Id: 145789, Name: 'Login with SSO' } as any)

    const result = await handleCreateFormattedUserStory(mockTp, baseParams)
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Id).toBe(145789)
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.createUserStory).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleCreateFormattedUserStory(mockTp, baseParams)

    expect(result.content[0].text).toContain('Failed to create formatted user story "Login with SSO"')
  })

  it('assembles sections in Header, Scenarios, Acceptance Criteria order', async () => {
    vi.mocked(mockTp.createUserStory).mockResolvedValue({ Id: 1 } as any)

    await handleCreateFormattedUserStory(mockTp, baseParams)

    const description = vi.mocked(mockTp.createUserStory).mock.calls[0][0].description as string
    const headerIndex = description.indexOf('<h3>Header</h3>')
    const scenariosIndex = description.indexOf('<h3>Scenarios</h3>')
    const acceptanceCriteriaIndex = description.indexOf('<h3>Acceptance Criteria</h3>')

    expect(headerIndex).toBeGreaterThanOrEqual(0)
    expect(scenariosIndex).toBeGreaterThan(headerIndex)
    expect(acceptanceCriteriaIndex).toBeGreaterThan(scenariosIndex)
  })

  it('omits the Definitions section when definitions is not provided', async () => {
    vi.mocked(mockTp.createUserStory).mockResolvedValue({ Id: 1 } as any)

    await handleCreateFormattedUserStory(mockTp, baseParams)

    const description = vi.mocked(mockTp.createUserStory).mock.calls[0][0].description as string
    expect(description).not.toContain('<h3>Definitions</h3>')
  })

  it('includes the Definitions section when provided', async () => {
    vi.mocked(mockTp.createUserStory).mockResolvedValue({ Id: 1 } as any)

    await handleCreateFormattedUserStory(mockTp, {
      ...baseParams,
      definitions: [{ term: 'SSO', description: 'Single Sign-On' }],
    })

    const description = vi.mocked(mockTp.createUserStory).mock.calls[0][0].description as string
    expect(description).toContain('<h3>Definitions</h3>')
    expect(description).toContain('SSO')
  })

  it('includes Examples Table and Edge Cases sections when provided', async () => {
    vi.mocked(mockTp.createUserStory).mockResolvedValue({ Id: 1 } as any)

    await handleCreateFormattedUserStory(mockTp, {
      ...baseParams,
      examplesTable: '| role | outcome |\n| admin | full access |',
      edgeCases: [{ name: 'SSO provider unreachable', steps: ['Given the SSO provider is down', 'When I click "Login with SSO"', 'Then I see a clear error message'] }],
    })

    const description = vi.mocked(mockTp.createUserStory).mock.calls[0][0].description as string
    expect(description).toContain('<h3>Examples Table</h3>')
    expect(description).toContain('<h3>Edge Cases</h3>')
    expect(description).toContain('SSO provider unreachable')
  })

  it('calls createUserStory with title and linking IDs', async () => {
    vi.mocked(mockTp.createUserStory).mockResolvedValue({ Id: 1 } as any)

    await handleCreateFormattedUserStory(mockTp, { ...baseParams, featureId: '145636', releaseId: '145200', teamId: '20' })

    expect(mockTp.createUserStory).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Login with SSO',
      featureId: '145636',
      releaseId: '145200',
      teamId: '20',
    }))
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleCreateFormattedFeature } from '../src/handlers/create_formatted_feature.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  createFeature: vi.fn(),
} as unknown as TpClient

const baseParams = {
  title: 'AI-assisted search',
  header: { businessBackground: 'Lets support agents resolve tickets faster by surfacing relevant docs automatically' },
  nonFunctionalRequirements: [
    { area: 'Security', requirement: 'Search queries are not logged with PII', status: 'Covered' as const, storyOrOwner: '145789' },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleCreateFormattedFeature', () => {
  it('returns created feature on success', async () => {
    vi.mocked(mockTp.createFeature).mockResolvedValue({ Id: 148636, Name: 'AI-assisted search' } as any)

    const result = await handleCreateFormattedFeature(mockTp, baseParams)
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Id).toBe(148636)
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.createFeature).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleCreateFormattedFeature(mockTp, baseParams)

    expect(result.content[0].text).toContain('Failed to create formatted feature "AI-assisted search"')
  })

  it('always includes the Non-Functional Requirements table', async () => {
    vi.mocked(mockTp.createFeature).mockResolvedValue({ Id: 1 } as any)

    await handleCreateFormattedFeature(mockTp, baseParams)

    const description = vi.mocked(mockTp.createFeature).mock.calls[0][0].description as string
    expect(description).toContain('<h3>Non-Functional Requirements</h3>')
    expect(description).toContain('Security')
    expect(description).toContain('Covered')
  })

  it('omits optional sections when not provided', async () => {
    vi.mocked(mockTp.createFeature).mockResolvedValue({ Id: 1 } as any)

    await handleCreateFormattedFeature(mockTp, baseParams)

    const description = vi.mocked(mockTp.createFeature).mock.calls[0][0].description as string
    expect(description).not.toContain('<h3>Definitions</h3>')
    expect(description).not.toContain('<h3>Scope & Boundaries</h3>')
    expect(description).not.toContain('<h3>Cross-Cutting Scenarios</h3>')
    expect(description).not.toContain('<h3>Child Stories</h3>')
    expect(description).not.toContain('<h3>Open Questions / Risks</h3>')
  })

  it('includes Scope, Cross-Cutting Scenarios, Child Stories, and Open Questions when provided', async () => {
    vi.mocked(mockTp.createFeature).mockResolvedValue({ Id: 1 } as any)

    await handleCreateFormattedFeature(mockTp, {
      ...baseParams,
      scope: { includes: ['Search within a single workspace'], excludes: ['Cross-workspace search'] },
      crossCuttingScenarios: [{ name: 'Tenant isolation', steps: ['Given two tenants exist', 'When tenant A searches', 'Then tenant B data never appears'] }],
      childStories: [{ id: '145789', name: 'Basic keyword search', covered: true }, { id: '145790', name: 'Fuzzy search', covered: false }],
      openQuestions: ['Who owns the relevance-tuning budget?'],
    })

    const description = vi.mocked(mockTp.createFeature).mock.calls[0][0].description as string
    expect(description).toContain('<h3>Scope & Boundaries</h3>')
    expect(description).toContain('Cross-workspace search')
    expect(description).toContain('<h3>Cross-Cutting Scenarios</h3>')
    expect(description).toContain('Tenant isolation')
    expect(description).toContain('<h3>Child Stories</h3>')
    expect(description).toContain('[x] 145789 — Basic keyword search (covered)')
    expect(description).toContain('[ ] 145790 — Fuzzy search (not yet covered by tests)')
    expect(description).toContain('<h3>Open Questions / Risks</h3>')
    expect(description).toContain('relevance-tuning budget')
  })

  it('calls createFeature with title and linking IDs', async () => {
    vi.mocked(mockTp.createFeature).mockResolvedValue({ Id: 1 } as any)

    await handleCreateFormattedFeature(mockTp, { ...baseParams, epicId: '148813', releaseId: '145200', teamId: '20' })

    expect(mockTp.createFeature).toHaveBeenCalledWith(expect.objectContaining({
      title: 'AI-assisted search',
      epicId: '148813',
      releaseId: '145200',
      teamId: '20',
    }))
  })
})

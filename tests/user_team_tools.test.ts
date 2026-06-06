import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetUsers } from '../src/handlers/get_users.js'
import { handleGetTeams, handleGetTeamsAndTeamAssignments } from '../src/handlers/get_teams.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getUsers: vi.fn(),
  getTeams: vi.fn(),
  getTeamAssignments: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetUsers', () => {
  it('returns all users as JSON', async () => {
    vi.mocked(mockTp.getUsers).mockResolvedValue({
      Next: '',
      Items: [
        { Id: 1, FirstName: 'Jane', LastName: 'Doe', Email: 'jane@example.com' },
        { Id: 2, FirstName: 'John', LastName: 'Smith', Email: 'john@example.com' },
      ] as any,
    })

    const result = await handleGetUsers(mockTp)
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toHaveLength(2)
    expect(parsed[0].FirstName).toBe('Jane')
    expect(parsed[1].Email).toBe('john@example.com')
  })

  it('returns failure message when request returns null', async () => {
    vi.mocked(mockTp.getUsers).mockResolvedValue(null as any)

    const result = await handleGetUsers(mockTp)

    expect(result.content[0].text).toContain('Failed to get users')
  })

  it('returns not found message when Items is empty', async () => {
    vi.mocked(mockTp.getUsers).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleGetUsers(mockTp)

    expect(result.content[0].text).toBe('No users found')
  })
})

describe('handleGetTeams', () => {
  it('returns teams mapped to id and name', async () => {
    vi.mocked(mockTp.getTeams).mockResolvedValue({
      Next: '',
      Items: [
        { Id: 10, Name: 'Alpha Team' },
        { Id: 11, Name: 'Beta Team' },
      ] as any,
    })

    const result = await handleGetTeams(mockTp)
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toEqual([
      { id: 10, name: 'Alpha Team' },
      { id: 11, name: 'Beta Team' },
    ])
  })

  it('returns failure message when request returns null', async () => {
    vi.mocked(mockTp.getTeams).mockResolvedValue(null as any)

    const result = await handleGetTeams(mockTp)

    expect(result.content[0].text).toContain('Failed to get teams')
  })

  it('returns not found message when Items is empty', async () => {
    vi.mocked(mockTp.getTeams).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleGetTeams(mockTp)

    expect(result.content[0].text).toBe('No teams found')
  })
})

describe('handleGetTeamsAndTeamAssignments', () => {
  it('returns teams and team assignments as JSON', async () => {
    vi.mocked(mockTp.getTeams).mockResolvedValue({
      Next: '',
      Items: [{ Id: 10, Name: 'Alpha Team' }] as any,
    })
    vi.mocked(mockTp.getTeamAssignments).mockResolvedValue({
      Next: '',
      Items: [{ Id: 99, Team: { Name: 'Alpha Team' } }] as any,
    })

    const result = await handleGetTeamsAndTeamAssignments(mockTp)
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.teams).toEqual([{ id: 10, name: 'Alpha Team' }])
    expect(parsed.teamAssignments).toEqual([{ id: 99, name: 'Alpha Team' }])
  })

  it('returns failure message when teams returns null', async () => {
    vi.mocked(mockTp.getTeams).mockResolvedValue(null as any)
    vi.mocked(mockTp.getTeamAssignments).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleGetTeamsAndTeamAssignments(mockTp)

    expect(result.content[0].text).toContain('Failed to get teams and team assignments')
  })

  it('returns failure message when team assignments returns null', async () => {
    vi.mocked(mockTp.getTeams).mockResolvedValue({ Next: '', Items: [{ Id: 10, Name: 'Alpha Team' }] as any })
    vi.mocked(mockTp.getTeamAssignments).mockResolvedValue(null as any)

    const result = await handleGetTeamsAndTeamAssignments(mockTp)

    expect(result.content[0].text).toContain('Failed to get teams and team assignments')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetLoggedInUser } from '../src/handlers/get_logged_in_user.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getContext: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetLoggedInUser', () => {
  it('returns the logged in user', async () => {
    const mockUser = { Id: 7, FirstName: 'Jane', LastName: 'Doe', Email: 'jane@example.com' }
    vi.mocked(mockTp.getContext).mockResolvedValue({ LoggedUser: mockUser } as any)

    const result = await handleGetLoggedInUser(mockTp)
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toEqual(mockUser)
  })

  it('returns failure message when context is null', async () => {
    vi.mocked(mockTp.getContext).mockResolvedValue(null as any)

    const result = await handleGetLoggedInUser(mockTp)

    expect(result.content[0].text).toContain('Failed to get context')
  })

  it('returns failure message when LoggedUser is missing from context', async () => {
    vi.mocked(mockTp.getContext).mockResolvedValue({ LoggedUser: null } as any)

    const result = await handleGetLoggedInUser(mockTp)

    expect(result.content[0].text).toContain('Failed to get logged in user')
  })
})

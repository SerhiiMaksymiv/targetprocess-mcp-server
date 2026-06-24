import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetUserById } from '../src/handlers/get_user_by_id.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getUser: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetUserById', () => {
  it('returns user data', async () => {
    const mockUser = {
      Id: 42,
      FirstName: 'Jane',
      LastName: 'Doe',
      Email: 'jane@example.com',
      IsActive: true,
    }
    vi.mocked(mockTp.getUser).mockResolvedValue(mockUser as any)

    const result = await handleGetUserById(mockTp, '42')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toEqual(mockUser)
  })

  it('returns failure message when user is not found', async () => {
    vi.mocked(mockTp.getUser).mockResolvedValue(null as any)

    const result = await handleGetUserById(mockTp, '99')

    expect(result.content[0].text).toContain('Failed to get user')
    expect(result.content[0].text).toContain('99')
  })

  it('calls getUser with the provided id', async () => {
    vi.mocked(mockTp.getUser).mockResolvedValue({ Id: 1 } as any)

    await handleGetUserById(mockTp, '123')

    expect(mockTp.getUser).toHaveBeenCalledWith('123')
  })
})

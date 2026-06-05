import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetUserStoryContent } from '../src/handlers/get_user_story_content.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getUserStory: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetUserStoryContent', () => {
  it('returns name, id, and stripped description', async () => {
    vi.mocked(mockTp.getUserStory).mockResolvedValue({
      Id: 145789,
      Name: 'User can log in',
      Description: '<p>As a user I want to <strong>log in</strong></p>',
      Feature: null,
      CustomFields: [],
    } as any)

    const result = await handleGetUserStoryContent(mockTp, '145789')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.id).toBe(145789)
    expect(parsed.name).toBe('User can log in')
    expect(parsed.description).toContain('log in')
    expect(parsed.description).not.toContain('<p>')
    expect(parsed.description).not.toContain('<strong>')
  })

  it('includes feature name and id when present', async () => {
    vi.mocked(mockTp.getUserStory).mockResolvedValue({
      Id: 100001,
      Name: 'Some story',
      Description: '<p>details</p>',
      Feature: { Id: 55000, Name: 'Auth Feature' },
      CustomFields: [],
    } as any)

    const result = await handleGetUserStoryContent(mockTp, '100001')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.feature).toBe('Auth Feature')
    expect(parsed.featureId).toBe(55000)
  })

  it('returns no-description message when description is empty', async () => {
    vi.mocked(mockTp.getUserStory).mockResolvedValue({
      Id: 100002,
      Name: 'Empty story',
      Description: '',
      Feature: null,
      CustomFields: [],
    } as any)

    const result = await handleGetUserStoryContent(mockTp, '100002')

    expect(result.content[0].text).toContain('No description')
    expect(result.content[0].text).toContain('100002')
  })

  it('returns failure message when user story is not found', async () => {
    vi.mocked(mockTp.getUserStory).mockResolvedValue(null as any)

    const result = await handleGetUserStoryContent(mockTp, '999999')

    expect(result.content[0].text).toContain('Failed to get user story')
    expect(result.content[0].text).toContain('999999')
  })

  it('calls getUserStory with the provided id', async () => {
    vi.mocked(mockTp.getUserStory).mockResolvedValue({
      Id: 1, Name: 'S', Description: '<p>x</p>', Feature: null, CustomFields: [],
    } as any)

    await handleGetUserStoryContent(mockTp, '123456')

    expect(mockTp.getUserStory).toHaveBeenCalledWith('123456')
  })

  it('strips complex HTML including lists and headings', async () => {
    vi.mocked(mockTp.getUserStory).mockResolvedValue({
      Id: 2,
      Name: 'Story',
      Description: '<h2>AC</h2><ol><li>Open app</li><li>Click sign in</li></ol>',
      Feature: null,
      CustomFields: [],
    } as any)

    const result = await handleGetUserStoryContent(mockTp, '100003')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.description).not.toContain('<h2>')
    expect(parsed.description).not.toContain('<ol>')
    expect(parsed.description).not.toContain('<li>')
    expect(parsed.description).toContain('Open app')
    expect(parsed.description).toContain('Click sign in')
  })
})

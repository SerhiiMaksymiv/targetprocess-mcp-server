import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleAddComment } from '../src/handlers/add_comment.js'
import { handleGetUserStoryComments } from '../src/handlers/get_user_story_comments.js'
import { handleGetBugComments } from '../src/handlers/get_bug_comments.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  addComment: vi.fn(),
  getUserStoryComments: vi.fn(),
  getBugComments: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleAddComment', () => {
  it('returns comment response on success', async () => {
    const mockComment = { Id: 1, Description: 'Test comment', Owner: { FullName: 'Jane Doe' } }
    vi.mocked(mockTp.addComment).mockResolvedValue(mockComment as any)

    const result = await handleAddComment(mockTp, '145789', 'Test comment')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Id).toBe(1)
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.addComment).mockResolvedValue(null as any)

    const result = await handleAddComment(mockTp, '145789', 'Test comment')

    expect(result.content[0].text).toContain('Failed to add comment')
    expect(result.content[0].text).toContain('145789')
  })

  it('calls addComment with the provided id and comment', async () => {
    vi.mocked(mockTp.addComment).mockResolvedValue({ Id: 1 } as any)

    await handleAddComment(mockTp, '145789', 'my comment')

    expect(mockTp.addComment).toHaveBeenCalledWith('145789', 'my comment')
  })
})

describe('handleGetUserStoryComments', () => {
  it('returns comments with stripped HTML', async () => {
    vi.mocked(mockTp.getUserStoryComments).mockResolvedValue({
      Next: '',
      Items: [{
        Id: 5,
        Description: '<p>Good point</p>',
        CreateDate: '2024-01-01',
        Owner: { FullName: 'Jane Doe' },
      }] as any,
    })

    const result = await handleGetUserStoryComments(mockTp, '145789')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed[0].id).toBe(5)
    expect(parsed[0].description).toContain('Good point')
    expect(parsed[0].description).not.toContain('<p>')
    expect(parsed[0].owner).toBe('Jane Doe')
  })

  it('returns failure when null', async () => {
    vi.mocked(mockTp.getUserStoryComments).mockResolvedValue(null as any)

    const result = await handleGetUserStoryComments(mockTp, '145789')

    expect(result.content[0].text).toContain('Failed to get comments for user story id: 145789')
  })

  it('returns not found when empty', async () => {
    vi.mocked(mockTp.getUserStoryComments).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleGetUserStoryComments(mockTp, '145789')

    expect(result.content[0].text).toContain('No comments found for user story id: 145789')
  })
})

describe('handleGetBugComments', () => {
  it('returns comments with stripped HTML', async () => {
    vi.mocked(mockTp.getBugComments).mockResolvedValue({
      Next: '',
      Items: [{
        Id: 7,
        Description: '<b>Reproduced on v2</b>',
        CreateDate: '2024-02-01',
        Owner: { FullName: 'John Smith' },
      }] as any,
    })

    const result = await handleGetBugComments(mockTp, '100001')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed[0].id).toBe(7)
    expect(parsed[0].description).toContain('Reproduced on v2')
    expect(parsed[0].description).not.toContain('<b>')
    expect(parsed[0].owner).toBe('John Smith')
  })

  it('returns failure when null', async () => {
    vi.mocked(mockTp.getBugComments).mockResolvedValue(null as any)

    const result = await handleGetBugComments(mockTp, '100001')

    expect(result.content[0].text).toContain('Failed to get comments for bug id: 100001')
  })

  it('returns not found when empty', async () => {
    vi.mocked(mockTp.getBugComments).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleGetBugComments(mockTp, '100001')

    expect(result.content[0].text).toContain('No comments found for bug id: 100001')
  })
})

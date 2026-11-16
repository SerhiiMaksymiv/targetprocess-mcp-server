import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetFeatureContent } from '../src/handlers/get_feature_content.js'
import { handleGetFeatureComments } from '../src/handlers/get_feature_comments.js'
import { handleUpdateFeature } from '../src/handlers/update_feature.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getFeature: vi.fn(),
  updateFeature: vi.fn(),
  getFeatureComments: vi.fn(),
  getAttachments: vi.fn().mockResolvedValue({ Items: [] }),
  fetchImageAsBase64: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetFeatureContent', () => {
  it('returns name, id, and stripped description', async () => {
    vi.mocked(mockTp.getFeature).mockResolvedValue({
      Id: 145636,
      Name: 'Feature A',
      Description: '<p>Some <strong>details</strong></p>',
      EntityState: { Name: 'Open' },
      Release: { Name: 'R1' },
      Epic: { Name: 'Epic A' },
      Progress: 0.5,
      Effort: 10,
      CustomFields: [],
    } as any)

    const result = await handleGetFeatureContent(mockTp, '145636')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.id).toBe(145636)
    expect(parsed.name).toBe('Feature A')
    expect(parsed.description).toBe('Some details')
    expect(parsed.entityState).toBe('Open')
  })

  it('returns failure message when feature is not found', async () => {
    vi.mocked(mockTp.getFeature).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleGetFeatureContent(mockTp, '145636')

    expect(result.content[0].text).toContain('Failed to get feature, id: 145636')
  })

  it('returns description images as image content blocks', async () => {
    vi.mocked(mockTp.getFeature).mockResolvedValue({
      Id: 145636,
      Name: 'Feature with screenshot',
      Description: '<img src="/Attachments.ashx?AttachmentID=1">',
      CustomFields: [],
    } as any)
    vi.mocked(mockTp.fetchImageAsBase64).mockResolvedValue({ data: 'base64data', mimeType: 'image/png' })

    const result = await handleGetFeatureContent(mockTp, '145636')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.imagesFound).toBe(1)
    expect(result.content[1]).toEqual({ type: 'image', data: 'base64data', mimeType: 'image/png' })
  })
})

describe('handleGetFeatureComments', () => {
  it('returns comments with stripped HTML', async () => {
    vi.mocked(mockTp.getFeatureComments).mockResolvedValue({
      Next: '',
      Items: [{
        Id: 9,
        Description: '<p>Looks good</p>',
        CreateDate: '2024-03-01',
        Owner: { FullName: 'Pat Lee' },
      }] as any,
    })

    const result = await handleGetFeatureComments(mockTp, '145636')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed[0].id).toBe(9)
    expect(parsed[0].description).toContain('Looks good')
    expect(parsed[0].description).not.toContain('<p>')
    expect(parsed[0].owner).toBe('Pat Lee')
  })

  it('returns failure when null', async () => {
    vi.mocked(mockTp.getFeatureComments).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleGetFeatureComments(mockTp, '145636')

    expect(result.content[0].text).toContain('Failed to get comments for feature id: 145636')
  })

  it('returns not found when empty', async () => {
    vi.mocked(mockTp.getFeatureComments).mockResolvedValue({ Next: '', Items: [] })

    const result = await handleGetFeatureComments(mockTp, '145636')

    expect(result.content[0].text).toContain('No comments found for feature id: 145636')
  })

  it('returns comment images as image content blocks', async () => {
    vi.mocked(mockTp.getFeatureComments).mockResolvedValue({
      Next: '',
      Items: [{
        Id: 9,
        Description: '<p>See screenshot</p><img src="/Attachments.ashx?AttachmentID=1">',
        CreateDate: '2024-03-01',
        Owner: { FullName: 'Pat Lee' },
      }] as any,
    })
    vi.mocked(mockTp.fetchImageAsBase64).mockResolvedValue({ data: 'base64data', mimeType: 'image/png' })

    const result = await handleGetFeatureComments(mockTp, '145636')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed[0].imagesFound).toBe(1)
    expect(result.content[1]).toEqual({ type: 'image', data: 'base64data', mimeType: 'image/png' })
  })
})

describe('handleUpdateFeature', () => {
  it('returns updated feature on success', async () => {
    vi.mocked(mockTp.updateFeature).mockResolvedValue({ Id: 145636, Name: 'Updated' } as any)

    const result = await handleUpdateFeature(mockTp, { id: '145636', title: 'Updated' })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Name).toBe('Updated')
    expect(mockTp.updateFeature).toHaveBeenCalledWith({ id: '145636', title: 'Updated' })
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.updateFeature).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleUpdateFeature(mockTp, { id: '145636' })

    expect(result.content[0].text).toContain('Failed to update feature id: 145636')
  })

  it('passes epicId, tags, and teamIterationId to updateFeature', async () => {
    vi.mocked(mockTp.updateFeature).mockResolvedValue({ Id: 145636 } as any)

    await handleUpdateFeature(mockTp, { id: '145636', epicId: '148813', tags: 'regression, mobile', teamIterationId: '789' })

    expect(mockTp.updateFeature).toHaveBeenCalledWith({ id: '145636', epicId: '148813', tags: 'regression, mobile', teamIterationId: '789' })
  })
})

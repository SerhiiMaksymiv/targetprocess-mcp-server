import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extractImageUrls } from '../src/html.js'
import { collectCardImages } from '../src/handlers/images.js'
import type { TpClient } from '../src/tp.js'

describe('extractImageUrls', () => {
  it('returns empty array for empty html', () => {
    expect(extractImageUrls('')).toEqual([])
  })

  it('extracts a single img src', () => {
    expect(extractImageUrls('<p>text</p><img src="/Attachments.ashx?AttachmentID=1">')).toEqual([
      '/Attachments.ashx?AttachmentID=1',
    ])
  })

  it('dedupes repeated img srcs', () => {
    const html = '<img src="/a.png"><img src="/a.png"><img src="/b.png">'
    expect(extractImageUrls(html)).toEqual(['/a.png', '/b.png'])
  })

  it('ignores img tags with no src', () => {
    expect(extractImageUrls('<img>')).toEqual([])
  })
})

describe('collectCardImages', () => {
  const mockTp = {
    getAttachments: vi.fn(),
    fetchImageAsBase64: vi.fn(),
  } as unknown as TpClient

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('merges description images with image attachments and fetches each once', async () => {
    vi.mocked(mockTp.getAttachments).mockResolvedValue({
      Items: [
        { Id: 1, Name: 'shot.png', Uri: '/attach/1', MimeType: 'image/png' },
        { Id: 2, Name: 'doc.pdf', Uri: '/attach/2', MimeType: 'application/pdf' },
      ],
    } as any)
    vi.mocked(mockTp.fetchImageAsBase64).mockResolvedValue({ data: 'xyz', mimeType: 'image/png' })

    const { foundCount, images } = await collectCardImages(mockTp, '1', '<img src="/attach/1">')

    expect(foundCount).toBe(1)
    expect(mockTp.fetchImageAsBase64).toHaveBeenCalledTimes(1)
    expect(images).toEqual([{ type: 'image', data: 'xyz', mimeType: 'image/png' }])
  })

  it('tolerates getAttachments failing and still returns description images', async () => {
    vi.mocked(mockTp.getAttachments).mockRejectedValue(new Error('boom'))
    vi.mocked(mockTp.fetchImageAsBase64).mockResolvedValue({ data: 'xyz', mimeType: 'image/png' })

    const { foundCount, images } = await collectCardImages(mockTp, '1', '<img src="/a.png">')

    expect(foundCount).toBe(1)
    expect(images).toHaveLength(1)
  })

  it('drops images that fail to fetch without throwing', async () => {
    vi.mocked(mockTp.getAttachments).mockResolvedValue({ Items: [] } as any)
    vi.mocked(mockTp.fetchImageAsBase64).mockResolvedValue(null)

    const { foundCount, images } = await collectCardImages(mockTp, '1', '<img src="/a.png">')

    expect(foundCount).toBe(1)
    expect(images).toEqual([])
  })

  it('returns no images when there are none to find', async () => {
    vi.mocked(mockTp.getAttachments).mockResolvedValue({ Items: [] } as any)

    const { foundCount, images } = await collectCardImages(mockTp, '1', '<p>no images here</p>')

    expect(foundCount).toBe(0)
    expect(images).toEqual([])
    expect(mockTp.fetchImageAsBase64).not.toHaveBeenCalled()
  })
})

import { describe, it, expect } from 'vitest'
import { guessMimeType } from '../src/mime.js'

describe('guessMimeType', () => {
  it('maps common image extensions', () => {
    expect(guessMimeType('screenshot.png')).toBe('image/png')
    expect(guessMimeType('photo.JPG')).toBe('image/jpeg')
    expect(guessMimeType('shot.webp')).toBe('image/webp')
  })

  it('maps a path with a full local filesystem prefix', () => {
    expect(guessMimeType('/tmp/some/dir/1.webp')).toBe('image/webp')
  })

  it('falls back to application/octet-stream for unknown extensions', () => {
    expect(guessMimeType('data.xyz')).toBe('application/octet-stream')
  })

  it('falls back to application/octet-stream when there is no extension', () => {
    expect(guessMimeType('README')).toBe('application/octet-stream')
  })
})

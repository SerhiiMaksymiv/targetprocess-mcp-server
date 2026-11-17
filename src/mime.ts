const EXTENSION_MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  pdf: 'application/pdf',
  txt: 'text/plain',
  csv: 'text/csv',
  json: 'application/json',
  zip: 'application/zip',
  mov: 'video/quicktime',
  mp4: 'video/mp4',
}

// Attachment uploads otherwise go to TP with no Content-Type, which TP then
// sniffs on its own (and sometimes gets wrong, e.g. tagging a .webp as
// audio/x-wav) — breaking anything downstream that filters by MIME type.
export function guessMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  return EXTENSION_MIME_TYPES[extension] || 'application/octet-stream'
}

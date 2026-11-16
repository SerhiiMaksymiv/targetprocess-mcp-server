import type { TpClient } from "../tp.js"
import type * as TP from "../types.js"
import { extractImageUrls } from "../html.js"

const MAX_IMAGES = 6

export type ImageContent = { type: "image"; data: string; mimeType: string }

// Fetches up to MAX_IMAGES of the given urls as base64 and returns them as
// MCP image content blocks. foundCount lets the caller note how many were
// located even if some (or all) failed to download.
export async function fetchImagesAsContent(
  tp: TpClient,
  urls: string[]
): Promise<{ foundCount: number; images: ImageContent[] }> {
  const limited = urls.slice(0, MAX_IMAGES)
  const fetched = await Promise.all(limited.map((url) => tp.fetchImageAsBase64(url)))

  const images = fetched
    .filter((img): img is { data: string; mimeType: string } => img !== null)
    .map((img) => ({ type: "image" as const, data: img.data, mimeType: img.mimeType }))

  return { foundCount: limited.length, images }
}

// Gathers inline <img> sources from the description plus image Attachments on
// the card, fetches each as base64, and returns them as MCP image content
// blocks. foundCount lets the caller note how many were located even if some
// (or all) failed to download.
export async function collectCardImages(
  tp: TpClient,
  generalId: string,
  descriptionHtml: string
): Promise<{ foundCount: number; images: ImageContent[] }> {
  const urls = new Set<string>(extractImageUrls(descriptionHtml))

  try {
    const attachments = await tp.getAttachments<TP.TpResponse<TP.Attachment>>(generalId)
    for (const attachment of attachments?.Items ?? []) {
      if (attachment.Uri && attachment.MimeType?.startsWith("image/")) {
        urls.add(attachment.Uri)
      }
    }
  } catch (error) {
    console.error("Error fetching TP attachments:", error)
  }

  return fetchImagesAsContent(tp, Array.from(urls))
}

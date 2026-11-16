import { JSDOM } from "jsdom"

// Targetprocess descriptions are HTML; img tags are the only place an
// embedded (as opposed to attached) image's location lives.
export function extractImageUrls(html: string): string[] {
  if (!html) return []

  const dom = new JSDOM(`<html><body><div id="content">${html}</div></body></html>`)
  const imgs = dom.window.document.querySelectorAll("#content img")

  const urls = new Set<string>()
  for (const img of imgs) {
    const src = img.getAttribute("src")
    if (src) urls.add(src)
  }

  return Array.from(urls)
}

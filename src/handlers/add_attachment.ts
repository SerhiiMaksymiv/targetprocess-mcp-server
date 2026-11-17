import { existsSync } from 'fs'
import type { TpClient } from '../tp.js'

export type AddAttachmentParams = {
  cardId: string
  filePath?: string
  fileContent?: string
  fileName?: string
}

export async function handleAddAttachment(tp: TpClient, params: AddAttachmentParams) {
  const { cardId, filePath, fileContent, fileName } = params

  if (!filePath && !(fileContent && fileName)) {
    return {
      content: [{
        type: 'text' as const,
        text: 'Provide either filePath, or both fileContent and fileName.',
      }],
    }
  }

  // filePath is read from this MCP server's own filesystem, not the calling
  // assistant's. A file attached directly in chat usually only exists in the
  // assistant's own sandbox, so this is the most common way callers get it
  // wrong — catch it here with a message that tells them how to recover,
  // instead of a bare upload failure.
  if (filePath && !existsSync(filePath)) {
    return {
      content: [{
        type: 'text' as const,
        text: `"${filePath}" does not exist on this MCP server's filesystem. If this file came from a chat attachment or upload rather than a path already on this machine, read its bytes yourself and retry with fileContent (base64) and fileName instead of filePath.`,
      }],
    }
  }

  const source = filePath ? { filePath } : { fileContent: fileContent as string, fileName: fileName as string }
  const response = await tp.addAttachedFile(cardId, source)

  if (response === null) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to upload attachment to card id: ${cardId}`,
      }],
    }
  }

  // TP's UploadFile.ashx returns JSON on success but we fall back to the raw
  // text if it ever doesn't, so the caller still gets something useful.
  let parsedResponse: unknown = response
  try {
    parsedResponse = JSON.parse(response)
  } catch {
    // keep raw text
  }

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({ cardId, uploaded: true, fileName: fileName ?? filePath, response: parsedResponse }),
    }],
  }
}

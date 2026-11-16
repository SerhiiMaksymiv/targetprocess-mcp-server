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

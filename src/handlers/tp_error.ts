/**
 * Turns a failed TP write (status + raw response body) into a readable message.
 * TP usually answers with JSON such as {"Status":"BadRequest","Message":"..."};
 * prefer its Message, otherwise fall back to the raw body.
 */
export function tpErrorText(status: number, body: string): string {
  let message = body
  try {
    const parsed = JSON.parse(body)
    if (parsed && typeof parsed.Message === 'string' && parsed.Message.trim()) message = parsed.Message
  } catch {
    // body was not JSON; keep it as-is
  }
  const where = status ? `HTTP ${status}` : 'request failed'
  return `${where}: ${message || '(no response body)'}`
}

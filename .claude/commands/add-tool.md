Add a new tool to this MCP server by following these steps in order:

1. Ask the user for the tool name, what TP API endpoint it should call, and what parameters it needs.
2. Add any new response types to `src/types.ts`:
   - For v1 API responses use `TpResponse<T>` (already defined).
   - For v2 API responses use `TpResponseV2<T>` (already defined).
   - Add a specific item interface if the response shape is new.
3. Add a method to the `TpClient` class in `src/tp.ts`:
   - For v1 endpoints, use the existing `this.get<T>()` or `this.post<T, U>()` helpers with `pathParam` and `param`.
   - For v2 endpoints, use the existing `this.get<T>()` or `this.post<T, U>()` helpers with `pathParam` and `param` and pass the `apiVersion` as the second argument.
4. Register the tool in `src/index.ts` using `server.registerTool()`:
   - Provide a clear `title` and `description`.
   - Define the `inputSchema` with Zod.
   - Return `{ content: [{ type: 'text', text: JSON.stringify(...) }] }`.
   - Strip HTML from any description fields using JSDOM before returning.
5. Run `npm run build` and confirm it succeeds.

Always read the existing source files before making changes to follow established patterns.

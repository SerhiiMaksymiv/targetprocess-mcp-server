import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetInProgressTasksAndBugs(tp: TpClient, userId: string) {
  const result = await tp.getInProgressTasksAndBugs(userId)

  const tasks = result.tasks.map((t: TP.Task) => ({
    type: 'Task',
    id: t.Id,
    name: t.Name,
    state: t.EntityState?.Name,
    userStoryId: t.UserStory?.Id,
    userStoryName: t.UserStory?.Name,
    featureId: t.UserStory?.Feature?.Id,
    featureName: t.UserStory?.Feature?.Name,
  }))

  const bugs = result.bugs.map((b: TP.Bug) => ({
    type: 'Bug',
    id: b.Id,
    name: b.Name,
    state: b.EntityState?.Name,
    userStoryId: b.UserStory?.Id,
    userStoryName: b.UserStory?.Name,
    featureId: b.UserStory?.Feature?.Id ?? b.Feature?.Id,
    featureName: b.UserStory?.Feature?.Name ?? b.Feature?.Name,
  }))

  const items = [...tasks, ...bugs]

  if (items.length === 0) {
    return {
      content: [{
        type: 'text' as const,
        text: `No in-progress tasks or bugs found for user ID: ${userId}`,
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items) }],
  }
}

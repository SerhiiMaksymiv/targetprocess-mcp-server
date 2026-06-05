import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetCommitMessage(tp: TpClient, id: string, type: 'task' | 'bug') {
  if (type === 'task') {
    const task = await tp.getTask<TP.Task>(id)

    if (!task) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get task with id: ${id}` }],
      }
    }

    const userStory = task.UserStory
    if (!userStory) {
      return {
        content: [{ type: 'text' as const, text: `Task ${id} has no linked user story` }],
      }
    }

    const feature = userStory.Feature
    const prefix = feature
      ? `F#${feature.Id} US#${userStory.Id} T#${task.Id}`
      : `US#${userStory.Id} T#${task.Id}`

    return {
      content: [{ type: 'text' as const, text: `${prefix} ${task.Name}` }],
    }
  }

  const bug = await tp.getBugWithRelations<TP.Bug>(id)

  if (!bug) {
    return {
      content: [{ type: 'text' as const, text: `Failed to get bug with id: ${id}` }],
    }
  }

  const userStory = bug.UserStory
  const feature = userStory?.Feature ?? bug.Feature

  if (!userStory) {
    return {
      content: [{ type: 'text' as const, text: `B#${bug.Id} ${bug.Name}` }],
    }
  }

  const prefix = feature
    ? `F#${feature.Id} US#${userStory.Id} B#${bug.Id}`
    : `US#${userStory.Id} B#${bug.Id}`

  return {
    content: [{ type: 'text' as const, text: `${prefix} ${bug.Name}` }],
  }
}

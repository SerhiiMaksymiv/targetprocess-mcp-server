import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetTeams(tp: TpClient) {
  const response = await tp.getTeams<TP.TpResponse<TP.Team>>()

  if (response instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get teams, Error: ${response.message}`
      }],
    }
  }

  const items = response.Items || []
  if (items.length === 0) {
    return {
      content: [{ type: 'text' as const, text: 'No teams found' }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items.map((t) => ({ id: t.Id, name: t.Name }))) }],
  }
}

export async function handleGetTeamsAndTeamAssignments(tp: TpClient) {
  const teams = await tp.getTeams<TP.TpResponse<TP.Team>>()
  const teamAssignments = await tp.getTeamAssignments<TP.TpResponse<TP.TeamAssignment>>()

  if (teams instanceof Error || teamAssignments instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get teams and team assignments, Error: ${teams instanceof Error ? teams.message : teamAssignments instanceof Error ? teamAssignments.message : ''}`
      }],
    }
  }

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        teams: teams.Items.map((t) => ({ id: t.Id, name: t.Name })),
        teamAssignments: teamAssignments.Items.map((t) => ({ id: t.Id, name: t.Team.Name })),
      }),
    }],
  }
}

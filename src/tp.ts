import { readFileSync } from "fs";
import { basename } from "path";
import { TpClientParameters, TpResponse, BugInputSchema, Bug, Task, LoggedUser } from "./types.js";
import { config } from "./config.js";

export class TpClient {

  private baseUrl: string = config.tp.url
  private token: string = config.tp.token
  private headers: HeadersInit
  private readonly v1 = '/api/v1'
  private readonly v2 = '/api/v2'

  constructor() {
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  }

  private params(params: TpClientParameters): string {
    let _url = this.baseUrl + (params.apiVersion || this.v1)
    for (const segment of params.pathParam) {
      _url += `/${segment}`
    }

    let _urlParams = []
    for (const [key, value] of Object.entries(params.param)) {
      _urlParams.push(`${key}=${encodeURIComponent(value)}`)
    }
    return _url + "/?" + _urlParams.join("&")
  }

  // @ts-ignore
  private async getAll<T>(params: TpClientParameters): Promise<T[]> {
    const allItems: T[] = []
    let skip = 0
    const take = 100

    while (true) {
      params.param["take"] = take
      params.param["skip"] = skip
      const page = await this.get<TpResponse<T>>(params)
      if (!page?.Items?.length) break
      allItems.push(...page.Items)
      if (!page.Next) break
      skip += take
    }

    return allItems
  }

  private async get<T>(params: TpClientParameters): Promise<T | null> {
    params.param["access_token"] = this.token
    let _url = this.params(params)
    try {
      const response = await fetch(_url, {
        method: "GET",
        headers: this.headers
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as T
    } catch (error) {
      console.error("Error making TP request:", error);
      console.error("Request URL:", _url);
      return null;
    }
  }

  private async post<T, U>(params: TpClientParameters, data: T): Promise<U | null> {
    params.param["access_token"] = this.token
    let _url = this.params(params)
    try {
      const response = await fetch(_url, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return (await response.json()) as U
    } catch (error) {
      console.error("Error making TP request:", error);
      return null;
    }
  }

  async getUserStory<T>(userStoryId: string): Promise<T> {
    const response = await this.get<T>({
      pathParam: ["userStories", userStoryId],
      param: { "format": "json" },
    }) as T

    return response
  }

  async getBug<T>(bugId: string): Promise<T> {
    const response = await this.get<T>({
      pathParam: ["bugs", bugId],
      param: { "format": "json" }
    }) as T

    return response
  }

  async getFeature<T>(featureId: string): Promise<T> {
    const response = await this.get<T>({
      pathParam: ["features", featureId],
      param: { "format": "json" }
    }) as T

    return response
  }

  async createBug<T>({ title, card, bugContent, origin = "Manual QA", projectId, teamId }: { title: string, card: { id: string, type: "UserStory" | "Bug" | "Feature" }, bugContent: string, origin?: string, projectId?: string, teamId?: string }): Promise<T> {
    const bug = {
      "Name": title,
      "Project": {
        "Id": projectId || config.tp.projectId
      },
      "customFields": [{
        "name": "Origin",
        "type": "DropDown",
        "value": origin
      }],
      "assignedTeams": [{
        "team": {
          "id": teamId || config.tp.teamId
        }
      }],
      "Description": bugContent,
    } as any

    if (card.type === "UserStory") {
      bug["UserStory"] = { "Id": card.id }
    } else if (card.type === "Feature") {
      bug["Feature"] = { "Id": card.id }
    }

    return this.post<any, T>({
      pathParam: ["bugs"],
      param: { "format": "json" },
    }, bug) as T
  }


  async updateUserStory<T>({ id, title, description, projectId, teamId, entityStateId }: { id: string, title?: string, description?: string, projectId?: string, teamId?: string, entityStateId?: string }): Promise<T> {
    const userStory: Record<string, any> = { "Id": id }

    if (title) userStory["Name"] = title
    if (description) userStory["Description"] = description
    if (projectId) userStory["Project"] = { "Id": projectId }
    if (teamId) userStory["assignedTeams"] = [{ "team": { "id": teamId } }]
    if (entityStateId) userStory["EntityState"] = { "Id": entityStateId }

    return this.post<any, T>({
      pathParam: ["UserStories"],
      param: { "format": "json" },
    }, userStory) as T
  }

  async updateBug<T>({ id, title, bugContent, origin, projectId, teamId, entityStateId }: { id: string, title?: string, bugContent?: string, origin?: string, projectId?: string, teamId?: string, entityStateId?: string }): Promise<T> {
    const bug: Record<string, any> = { "Id": id }

    if (title) bug["Name"] = title
    if (bugContent) bug["Description"] = bugContent
    if (origin) bug["customFields"] = [{
      "name": "Origin",
      "type": "DropDown",
      "value": origin
    }]
    if (projectId) bug["Project"] = { "Id": projectId }
    if (teamId) bug["assignedTeams"] = [{
      "team": {
        "id": teamId || config.tp.teamId
      }
    }]
    if (entityStateId) bug["entityState"] = { "id": entityStateId }

    return this.post<any, T>({
      pathParam: ["bugs"],
      param: { "format": "json" },
    }, bug) as T
  }

  async createBugOnly<T>({ title, bugContent, origin = "Manual QA", projectId, teamId, entityStateId }: BugInputSchema): Promise<T> {
    const bug: Record<string, any> = {
      "Name": title,
      "Project": {
        "Id": projectId || config.tp.projectId
      },
      "customFields": [{
        "name": "Origin",
        "type": "DropDown",
        "value": origin
      }],
      "assignedTeams": [{
        "team": {
          "id": teamId || config.tp.teamId
        }
      }],
      "Description": bugContent,
    }

    if (entityStateId) bug["EntityState"] = { "Id": entityStateId }

    return this.post<any, T>({
      pathParam: ["bugs"],
      param: { "format": "json" },
    }, bug) as T
  }

  async createUserStory<T>({ title, description, featureId, releaseId, projectId, teamId }: { title: string, description?: string, featureId?: string, releaseId?: string, projectId?: string, teamId?: string }): Promise<T> {
    const userStory: Record<string, any> = {
      "Name": title,
      "Project": { "Id": projectId || config.tp.projectId },
      "assignedTeams": [{ "team": { "id": teamId || config.tp.teamId } }],
    }

    if (description) userStory["Description"] = description
    if (featureId) userStory["Feature"] = { "Id": featureId }
    if (releaseId) userStory["Release"] = { "Id": releaseId }

    return this.post<any, T>({
      pathParam: ["UserStories"],
      param: { "format": "json" },
    }, userStory) as T
  }

  async createFeature<T>({ title, description, epicId, releaseId, projectId, teamId }: { title: string, description?: string, epicId?: string, releaseId?: string, projectId?: string, teamId?: string }): Promise<T> {
    const feature: Record<string, any> = {
      "Name": title,
      "Project": { "Id": projectId || config.tp.projectId },
      "assignedTeams": [{ "team": { "id": teamId || config.tp.teamId } }],
    }

    if (description) feature["Description"] = description
    if (epicId) feature["Epic"] = { "Id": epicId }
    if (releaseId) feature["Release"] = { "Id": releaseId }

    return this.post<any, T>({
      pathParam: ["Features"],
      param: { "format": "json" },
    }, feature) as T
  }

  async createBugBasedOnUserStory<T>(title: string, userStoryId: string, bugContent: string): Promise<T> {
    const bug = {
      "Name": title,
      "Project": {
        "Id": config.tp.projectId
      },
      "UserStory": {
        "Id": userStoryId
      },
      "customFields": [{
        "name": "Origin",
        "type": "DropDown",
        "value": "Manual QA"
      }],
      "assignedTeams": [{
        "team": {
          "id": config.tp.teamId
        }
      }],
      "Description": bugContent,
    }

    return this.post<any, T>({
      pathParam: ["bugs"],
      param: { "format": "json" },
    }, bug) as T
  }

  async createTestCase<T>(name: string, description: string, testPlanId: string): Promise<T> {
    const testCase = {
      "Name": name,
      "Project": { "Id": config.tp.projectId },
      "Description": description,
      "TestPlans": [{
        "Id": testPlanId
      }],
    }

    return this.post<any, T>({
      pathParam: ["testCases"],
      param: { "format": "json" },
    }, testCase) as T
  }

  async createTestPlan<T>(title: string, resourceId: string, resourceType: 'UserStory' | 'Bug' | 'Feature' = 'UserStory', options?: { description?: string; startDate?: string; endDate?: string }): Promise<T> {
    const testPlan: Record<string, any> = {
      "Name": `Test Plan: ${title}`,
      "Project": {
        "Id": config.tp.projectId
      },
      "LinkedGeneral": {
        "ResourceType": "General",
        "Id": resourceId,
        "Name": title,
      },
      "LinkedAssignable": {
        "ResourceType": "Assignable",
        "Id": resourceId,
        "Name": title,
      },
    }

    if (resourceType === 'UserStory') {
      testPlan["LinkedUserStory"] = { "ResourceType": "UserStory", "Id": resourceId, "Name": title }
    } else if (resourceType === 'Bug') {
      testPlan["LinkedBug"] = { "ResourceType": "Bug", "Id": resourceId, "Name": title }
    } else if (resourceType === 'Feature') {
      testPlan["LinkedFeature"] = { "ResourceType": "Feature", "Id": resourceId, "Name": title }
    }

    if (options?.description) testPlan["Description"] = options.description
    if (options?.startDate) testPlan["StartDate"] = options.startDate
    if (options?.endDate) testPlan["EndDate"] = options.endDate

    return this.post<any, T>({
      pathParam: ["testPlans"],
      param: { "format": "json" },
    }, testPlan) as T
  }

  async getUser<T>(userId: string): Promise<T> {
    return this.get<T>({
      pathParam: ["Users", userId],
      param: { "format": "json" },
    }) as T
  }

  async getUsers<T>(): Promise<T> {
    return this.get<T>({
      pathParam: ["Users"],
      param: { "format": "json" },
    }) as T
  }

  async addCommentWithUser<T>(userStoryId: string, comment: string, user: LoggedUser): Promise<T> {
    const userAt = user ? `cc - <div>@user:${user.Email}[${user.FirstName} ${user.LastName}]&nbsp;</div>` : ''
    const commentContent = `${comment}\nn${userAt}`
    const commentData = {
      description: commentContent,
      owner: {
        id: config.tp.ownerId
      },
      general: {
        id: userStoryId,
      },
    }

    return this.post<any, T>({
      pathParam: ["comments"],
      param: { "format": "json" },
    }, commentData) as T
  }

  async addComment<T>(userStoryId: string, comment: string): Promise<T> {
    const commentData = {
      description: comment,
      owner: {
        id: config.tp.ownerId
      },
      general: {
        id: userStoryId,
      },
    }

    return this.post<any, T>({
      pathParam: ["comments"],
      param: { "format": "json" },
    }, commentData) as T
  }

  async addTestStep<T>(testCaseId: string, testStep: { description: string, result: string }): Promise<T> {
    const testStepData = {
      "Description": testStep.description,
      "Result": testStep.result,
      "TestCase": { "Id": testCaseId },
    }

    return this.post<any, T>({
      pathParam: ["testSteps"],
      param: { "format": "json" },
    }, testStepData) as T
  }

  async getBugComments<T>(bugId: string, results: number = 25): Promise<T> {
    const response = await this.get<T>({
      pathParam: ["Bugs", bugId, "Comments"],
      param: {
        "format": "json",
        "take": results,
      }
    }) as T

    return response
  }

  async getUserStoryComments<T>(userStoryId: string, results: number = 25): Promise<T> {
    const response = await this.get<T>({
      pathParam: ["UserStories", userStoryId, "Comments"],
      param: {
        "format": "json",
        "take": results,
      }
    }) as T

    return response
  }

  async searchContainsNameText<T>({ text, entityType }: { text: string, entityType: "Generals" | "UserStories" | "Bugs" | "Features" }): Promise<T> {
    return this.get<T>({
      pathParam: [entityType],
      param: {
        "format": "json",
        "take": "25",
        "where": `Name contains '${text}'`,
        "include": "[Name, Description, Id]"
      },
    }) as T
  }

  async searchContainsDescriptionText<T>({ text, entityType }: { text: string, entityType: "Generals" | "UserStories" | "Bugs" | "Features" }): Promise<T> {
    return this.get<T>({
      pathParam: [entityType],
      param: {
        "where": `Description contains '${text}' and EntityState.Name eq 'Done'`,
        "format": "json",
        "take": "50",
      },
    }) as T
  }

  async getCurrentReleases<T>(): Promise<T> {
    return this.get<T>({
      pathParam: ["Releases"],
      param: {
        "format": "json",
        "where": `IsCurrent eq 'true'`,
      },
    }) as T
  }

  async getReleaseUserStories<T>({ name, results = 50, withDescription = false }: { name: string, results?: number, withDescription?: boolean }): Promise<T> {
    const includeFilter = withDescription ? "[Name, Description, Id]" : "[Name, Id]"
    return this.get<T>({
      pathParam: ["UserStories"],
      param: {
        "format": "json",
        "take": results,
        "where": `Release.Name eq '${name}'`,
        "include": includeFilter,
      }
    }) as T
  }

  async getReleaseOpenUserStories<T>({ name, results = 100, withDescription = false }: { name: string, results?: number, withDescription?: boolean }): Promise<T> {
    const includeFilter = withDescription ? "[Name, Description, Id]" : "[Name, Id]"
    return this.get<T>({
      pathParam: ["UserStories"],
      param: {
        "format": "json",
        "take": results,
        "where": `Release.Name eq '${name}' and EntityState.Name ne 'Closed' and EntityState.Name ne 'Done' and EntityState.Name ne 'Passed Dev01  QA' and EntityState.Name ne 'Ready to Deploy to prod'`,
        "include": includeFilter,
      }
    }) as T
  }

  async getReleaseOpenBugs<T>({ name, results = 200, withDescription = false }: { name: string, results?: number, withDescription?: boolean }): Promise<T> {
    const includeFilter = withDescription ? "[Name, Description, Id]" : "[Name, Id]"
    return this.get<T>({
      pathParam: ["Bugs"],
      param: {
        "format": "json",
        "take": results,
        "where": `Release.Name eq '${name}' and EntityState.Name ne 'Closed' and EntityState.Name ne 'Done' and EntityState.Name ne 'Passed Dev01  QA' and EntityState.Name ne 'Ready to Deploy to prod'`,
        "include": includeFilter,
      }
    }) as T
  }

  async getReleaseBugs<T>({ name, results = 100, withDescription = false }: { name: string, results?: number, withDescription?: boolean }): Promise<T> {
    const includeFilter = withDescription ? "[Name, Description, Id]" : "[Name, Id]"
    return this.get<T>({
      pathParam: ["Bugs"],
      param: {
        "format": "json",
        "take": results,
        "where": `Release.Name eq '${name}'`,
        "include": includeFilter,
      }
    }) as T
  }

  async getReleaseFeatures<T>({ name, results = 50, withDescription = false }: { name: string, results?: number, withDescription?: boolean }): Promise<T> {
    const includeFilter = withDescription ? "[Name, Description, Id]" : "[Name, Id]"
    return this.get<T>({
      pathParam: ["Features"],
      param: {
        "format": "json",
        "take": results,
        "where": `Release.Name eq '${name}'`,
        "include": includeFilter,
      }
    }) as T
  }

  async getFeatureUserStories<T>(featureId: string): Promise<T> {
    return this.get<T>({
      pathParam: ["features"],
      param: {
        "format": "json",
        "where": `(id==${featureId})`,
        "select": `{userStories}`,
      },
      apiVersion: this.v2
    }) as T
  }

  async getUserStoryBugs<T>(userStoryId: string): Promise<T> {
    return this.get<T>({
      pathParam: ["userstories"],
      param: {
        "format": "json",
        "where": `(id==${userStoryId})`,
        "select": `{bugs}`,
      },
      apiVersion: this.v2
    }) as T
  }

  async getUserStoriesIdsByFeatureId<T>(featureId: string): Promise<T> {
    return this.get<T>({
      pathParam: ["userstories"],
      param: {
        "format": "json",
        "where": `(Feature.Id==${featureId})`,
        "select": `{id}`,
      },
      apiVersion: this.v2
    }) as T
  }

  async getUserStoryTestPlan<T>(userStoryId: string): Promise<T> {
    return this.get<T>({
      pathParam: ["userStories", userStoryId],
      param: {
        "format": "json",
        "select": `{id,storyName:name,linkedtestplan}`,
      },
      apiVersion: this.v2
    }) as T
  }

  async getCardTestPlan<T>(cardId: string, resourceType: 'UserStory' | 'Bug' | 'Feature' = 'UserStory'): Promise<T> {
    const pathMap = { UserStory: "userStories", Bug: "bugs", Feature: "features" }
    return this.get<T>({
      pathParam: [pathMap[resourceType], cardId],
      param: {
        "format": "json",
        "select": `{id,linkedtestplan}`,
      },
    }) as T
  }

  async getTestPlanTestCases<T>(testPlanId: string): Promise<T> {
    return this.get<T>({
      pathParam: ["testPlans", testPlanId, "testcases"],
      param: { "format": "json" },
    }) as T
  }

  async getTestCaseSteps<T>(testCaseId: string): Promise<T> {
    return this.get<T>({
      pathParam: ["testCases", testCaseId, "teststeps"],
      param: { "format": "json" },
    }) as T
  }

  async getProjects<T>(): Promise<T> {
    return this.get<T>({
      pathParam: ["Projects"],
      param: { "format": "json" },
    }) as T
  }

  async getProcessWorkflows<T>({ processId }: { processId?: string }): Promise<T> {
    return this.get<T>({
      pathParam: ["Process"],
      param: {
        "format": "json",
        "where": `id=(${processId})`,
        "select": `{Workflows}`
      },
      apiVersion: this.v2
    }) as T
  }

  async getUserStories<T>({ take = 100 }: { take?: number }): Promise<T> {
    return this.get<T>({
      pathParam: ["userStories"],
      param: {
        "format": "json",
        "take": take,
      },
      apiVersion: this.v2
    }) as T
  }

  async getProcesses<T>(): Promise<T> {
    return this.get<T>({
      pathParam: ["Processes"],
      param: { "format": "json" },
    }) as T
  }

  async getTeams<T>(): Promise<T> {
    return this.get<T>({
      pathParam: ["Teams"],
      param: { "format": "json" },
    }) as T
  }

  async getUserStoryWorkflows<T>(): Promise<T> {
    return this.get<T>({
      pathParam: ["workflow"],
      param: {
        "format": "json",
        "select": `{Id,Name,Process,EntityType,EntityStates.Select({Id,Name}) as EntityStates}`,
        "where": `(process.id=${config.tp.processId} and entityType.name="userStory" and parentWorkflow=null)`,
        "take": "1",
      },
      apiVersion: this.v2
    }) as T
  }

  async getUserStoryWorkflowsWithSubStates<T>(): Promise<T> {
    return this.get<T>({
      pathParam: ["EntityState"],
      param: {
        "format": "json",
        "select": `{id,name,isInitial,isFinal,isDefaultFinal,isPlanned,workflow:{workflow.id,process:{workflow.process.id}},entityType:{entityType.name},subEntityStates:subEntityStates.Select({id,name,entityType:{entityType.name},isInitial,isFinal,isDefaultFinal,isPlanned})}`,
        "where": `(parentEntityState==null and workflow.process.id in [${config.tp.processId}])`,
        "take": "1000",
      },
      apiVersion: this.v2
    }) as T
  }

  async getBugWorkflows<T>(): Promise<T> {
    return this.get<T>({
      pathParam: ["workflow"],
      param: {
        "format": "json",
        "select": `{Id,Name,Process,EntityType,EntityStates.Select({Id,Name}) as EntityStates}`,
        "where": `(process.id=${config.tp.processId} and entityType.name="bug" and parentWorkflow=null)`,
        "take": "1",
      },
      apiVersion: this.v2
    }) as T
  }

  async getCardStatus<T>(cardId: string, resourceType: 'UserStory' | 'Bug' | 'Feature' = 'UserStory'): Promise<T> {
    const pathMap = { UserStory: 'userStory', Bug: 'bug', Feature: 'feature' }
    return this.get<T>({
      pathParam: [pathMap[resourceType]],
      param: {
        "select": `{Project:{Project.Id},EntityState:{EntityState.Id,EntityState.Name,EntityState.NextStates,EntityState.Workflow.Id as WorkflowId},TeamState:{ResponsibleTeam.Id,Team:{ResponsibleTeam.Team.Id,ResponsibleTeam.Team.Name},EntityState:{ResponsibleTeam.EntityState.Id,ResponsibleTeam.EntityState.Name,ResponsibleTeam.EntityState.Workflow.Id as WorkflowId}},AssignedTeams.Select({TeamAssignmentId:Id,Id:Team.Id,Name:Team.Name}) as Teams}`,
        "where": `(id=${cardId})`,
        "take": "1",
      },
      apiVersion: this.v2
    }) as T
  }

  async getContext<T>(): Promise<T> {
    return this.get<T>({
      pathParam: ["Context"],
      param: { "format": "json" }
    }) as T
  }

  async getInProgressTasksAndBugs(userId: string): Promise<{ tasks: Task[], bugs: Bug[] }> {
    const where = `(EntityState.Name eq 'In Progress') and (AssignedUser.Id eq ${userId})`
    const include = "[Id,Name,EntityState[Name],UserStory[Id,Name,Feature[Id,Name]]]"
    const param = { "format": "json", "where": where, "include": include, "orderByDesc": "ModifyDate" }

    const [tasks, bugs] = await Promise.all([
      this.get<TpResponse<Task>>({ pathParam: ["Tasks"], param }),
      this.get<TpResponse<Bug>>({ pathParam: ["Bugs"], param }),
    ])

    return {
      tasks: tasks?.Items ?? [],
      bugs: bugs?.Items ?? [],
    }
  }

  async getTask<T>(taskId: string): Promise<T> {
    const response = await this.get<T>({
      pathParam: ["Tasks", taskId],
      param: {
        "format": "json",
        "include": "[Id,Name,UserStory[Id,Name,Feature[Id,Name]]]",
      }
    }) as T

    return response
  }

  async getBugWithRelations<T>(bugId: string): Promise<T> {
    const response = await this.get<T>({
      pathParam: ["Bugs", bugId],
      param: {
        "format": "json",
        "include": "[Id,Name,UserStory[Id,Name,Feature[Id,Name]]]",
      }
    }) as T

    return response
  }

  async createTask<T>({ title, description, userStoryId }: { title: string, description?: string, userStoryId: string }): Promise<T> {
    const task: Record<string, any> = {
      "Name": title,
      "Project": {
        "Id": config.tp.projectId
      },
      "UserStory": {
        "Id": userStoryId
      },
    }

    if (description) {
      task["Description"] = description
    }

    return this.post<any, T>({
      pathParam: ["Tasks"],
      param: { "format": "json" },
    }, task) as T
  }

  async logTime<T>({
    entityId,
    entityType,
    hours,
    description,
    date,
  }: {
    entityId: string
    entityType: 'Task' | 'UserStory' | 'Bug'
    hours: number
    description?: string
    date?: string
  }): Promise<T> {
    const timestamp = date ? new Date(date).getTime() : Date.now()
    const body: Record<string, any> = {
      Spent: hours,
      Date: `/Date(${timestamp})/`,
      User: { Id: config.tp.ownerId },
      Assignable: { Id: entityId, ResourceType: entityType },
    }
    if (description) body["Description"] = description

    return this.post<any, T>({
      pathParam: ["Times"],
      param: { "format": "json" },
    }, body) as T
  }

  async getMyTimeLogs<T>(take: number = 25): Promise<T> {
    return this.get<T>({
      pathParam: ["Times"],
      param: {
        "format": "json",
        "where": `User.Id eq ${config.tp.ownerId}`,
        "include": "[Id,Spent,Date,Description,Assignable[Id,Name,ResourceType]]",
        "orderByDesc": "Date",
        "take": take,
      },
    }) as T
  }

  async getMyUserStories<T>({ state, take = 25, skip = 0 }: { state?: string, take?: number, skip?: number }): Promise<T> {
    const whereParts = [`AssignedUser.Id eq ${config.tp.ownerId}`]
    if (state) whereParts.push(`EntityState.Name contains '${state}'`)

    return this.get<T>({
      pathParam: ["UserStories"],
      param: {
        "format": "json",
        "where": whereParts.join(' and '),
        "include": "[Id,Name,EntityState[Name],Effort,Project[Name],Feature[Id,Name],CreateDate,ModifyDate]",
        "orderByDesc": "ModifyDate",
        "take": take,
        "skip": skip,
      },
    }) as T
  }

  async getMyBugs<T>({ state, take = 25, skip = 0 }: { state?: string, take?: number, skip?: number }): Promise<T> {
    const whereParts = [`AssignedUser.Id eq ${config.tp.ownerId}`]
    if (state) whereParts.push(`EntityState.Name contains '${state}'`)

    return this.get<T>({
      pathParam: ["Bugs"],
      param: {
        "format": "json",
        "where": whereParts.join(' and '),
        "include": "[Id,Name,EntityState[Name],Severity[Name],Priority[Name],Project[Name],UserStory[Id,Name],CreateDate,ModifyDate]",
        "orderByDesc": "ModifyDate",
        "take": take,
        "skip": skip,
      },
    }) as T
  }

  async addAttachedFile(generalId: string, source: { filePath: string } | { fileContent: string; fileName: string }): Promise<string | null> {
    let blob: Blob
    let fileName: string

    if ("filePath" in source) {
      blob = new Blob([readFileSync(source.filePath)])
      fileName = basename(source.filePath)
    } else {
      blob = new Blob([Buffer.from(source.fileContent, "base64")])
      fileName = source.fileName
    }

    const formData = new FormData()
    formData.append("generalId", generalId)
    formData.append("file", blob, fileName)

    const url = `${this.baseUrl}/UploadFile.ashx?access_token=${this.token}`
    console.error(JSON.stringify({ "UPLOAD_URL": url.replace(this.token, "***") }, null, 2))

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.text()
    } catch (error) {
      console.error("Error uploading file:", error)
      return null
    }
  }
}

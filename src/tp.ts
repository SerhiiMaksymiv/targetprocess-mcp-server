import { TpClientParameters, TpResponse } from "./types.js";
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
    for (const [key, value] of Object.entries(params.pathParam)) {
      _url += value ? `/${key}/${value}` : `/${key}`
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
    console.error(JSON.stringify({ "TP_URL": _url }, null, 2))
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
      pathParam: { "userStories": userStoryId },
      param: { "format": "json" },
    }) as T

    return response
  }

  async getBug<T>(bugId: string): Promise<T> {
    const response = await this.get<T>({
      pathParam: { "bugs": bugId },
      param: { "format": "json" }
    }) as T

    return response
  }

  async getFeature<T>(featureId: string): Promise<T> {
    const response = await this.get<T>({
      pathParam: { "features": featureId },
      param: { "format": "json" }
    }) as T

    return response
  }

  async createBug<T>({ title, card, bugContent, origin = "Manual QA" }: { title: string, card: { id: string, type: "UserStory" | "Bug" }, bugContent: string, origin?: string }): Promise<T> {
    const bug = {
      "Name": title,
      "Project": {
        "Id": config.tp.projectId
      },
      "customFields": [{
        "name": "Origin",
        "type": "DropDown",
        "value": origin
      }],
      "assignedTeams": [{
        "team": {
          "id": config.tp.teamId
        }
      }],
      "Description": bugContent,
    } as any

    if (card.type === "UserStory") {
      bug["UserStory"] = {
        "Id": card.id
      }
    }

    return this.post<any, T>({
      pathParam: { "bugs": '' },
      param: { "format": "json" },
    }, bug) as T
  }

  async createBugOnly<T>({ title, bugContent, origin = "Manual QA" }: { title: string, bugContent: string, origin?: string }): Promise<T> {
    const bug = {
      "Name": title,
      "Project": {
        "Id": config.tp.projectId
      },
      "customFields": [{
        "name": "Origin",
        "type": "DropDown",
        "value": origin
      }],
      "assignedTeams": [{
        "team": {
          "id": config.tp.teamId
        }
      }],
      "Description": bugContent,
    }

    return this.post<any, T>({
      pathParam: { "bugs": '' },
      param: { "format": "json" },
    }, bug) as T
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
      pathParam: { "bugs": '' },
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
      pathParam: { "testCases": '' },
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
      pathParam: { "testPlans": '' },
      param: { "format": "json" },
    }, testPlan) as T
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
      pathParam: { "comments": '' },
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
      pathParam: { "testSteps": '' },
      param: { "format": "json" },
    }, testStepData) as T
  }

  async getBugComments<T>(bugId: string, results: number = 25): Promise<T> {
    const response = await this.get<T>({
      pathParam: {
        "Bugs": bugId,
        "Comments": "",
      },
      param: {
        "format": "json",
        "take": results,
      }
    }) as T

    return response
  }

  async getUserStoryComments<T>(userStoryId: string, results: number = 25): Promise<T> {
    const response = await this.get<T>({
      pathParam: {
        "UserStories": userStoryId,
        "Comments": "",
      },
      param: {
        "format": "json",
        "take": results,
      }
    }) as T

    return response
  }

  async searchContainsNameText<T>({ text, entityType }: { text: string, entityType: "Generals" | "UserStories" | "Bugs" | "Features" }): Promise<T> {
    return this.get<T>({
      pathParam: { [entityType]: '' },
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
      pathParam: { [entityType]: '' },
      param: {
        "where": `Description contains '${text}' and EntityState.Name eq 'Done'`,
        "format": "json",
        "take": "50",
      },
    }) as T
  }

  async getCurrentReleases<T>(): Promise<T> {
    return this.get<T>({
      pathParam: { "Releases": '' },
      param: {
        "format": "json",
        "where": `IsCurrent eq 'true'`,
      },
    }) as T
  }

  async getReleaseUserStories<T>({ name, results = 50, withDescription = false }: { name: string, results?: number, withDescription?: boolean }): Promise<T> {
    const includeFilter = withDescription ? "[Name, Description, Id]" : "[Name, Id]"
    return this.get<T>({
      pathParam: { "UserStories": '' },
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
      pathParam: { "UserStories": '' },
      param: {
        "format": "json",
        "take": results,
        "where": `Release.Name eq '${name}' and EntityState.Name ne 'Closed' and EntityState.Name ne 'Done' and EntityState.Name ne 'Passed Dev01  QA' and EntityState.Name ne 'Ready to Deploy to prod'`,
        "include": includeFilter,
      }
    }) as T
  }

  async getReleaseOpenBugs<T>({ name, results = 200, withDescription = false }: { name: string, results?: number, withDescription?: boolean }): Promise<T> {
    const includeFilter = withDescription ? "[Name, Description, Id]" : "[Name, Id]"
    return this.get<T>({
      pathParam: { "Bugs": '' },
      param: {
        "format": "json",
        "take": results,
        "where": `Release.Name eq '${name}' and EntityState.Name ne 'Closed' and EntityState.Name ne 'Done' and EntityState.Name ne 'Passed Dev01  QA' and EntityState.Name ne 'Ready to Deploy to prod'`,
        "include": includeFilter,
      }
    }) as T
  }

  async getReleaseBugs<T>({ name, results = 100, withDescription = false }: { name: string, results?: number, withDescription?: boolean }): Promise<T> {
    const includeFilter = withDescription ? "[Name, Description, Id]" : "[Name, Id]"
    return this.get<T>({
      pathParam: { "Bugs": '' },
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
      pathParam: { "Features": '' },
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
      pathParam: { "features": '' },
      param: {
        "format": "json",
        "where": `(id==${featureId})`,
        "select": `{userStories}`,
      },
      apiVersion: this.v2
    }) as T
  }

  async getUserStoriesIdsByFeatureId<T>(featureId: string): Promise<T> {
    return this.get<T>({
      pathParam: { "userstories": '' },
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
      pathParam: { "userStories": userStoryId },
      param: {
        "format": "json",
        "select": `{id,storyName:name,linkedtestplan}`,
      },
      apiVersion: this.v2
    }) as T
  }

  async getCardTestPlan<T>(cardId: string, resourceType: 'UserStory' | 'Bug' | 'Feature' = 'UserStory'): Promise<T> {
    let requestPath = ""
    if (resourceType === 'UserStory') {
      requestPath = "userStories"
    } else if (resourceType === 'Bug') {
      requestPath = "bugs"
    } else if (resourceType === 'Feature') {
      requestPath = "features"
    }
    return this.get<T>({
      pathParam: { [requestPath]: cardId },
      param: {
        "format": "json",
        "select": `{id,linkedtestplan}`,
      },
    }) as T
  }

  async getTestPlanTestCases<T>(testPlanId: string): Promise<T> {
    return this.get<T>({
      pathParam: {
        "testPlans": testPlanId,
        "testcases": "",
      },
      param: { "format": "json" },
    }) as T
  }

  async getTestCaseSteps<T>(testCaseId: string): Promise<T> {
    return this.get<T>({
      pathParam: {
        "testCases": testCaseId,
        "teststeps": "",
      },
      param: { "format": "json", },
    }) as T
  }

  async getProjects<T>(): Promise<T> {
    return this.get<T>({
      pathParam: { "Projects": '' },
      param: { "format": "json" },
    }) as T
  }

  async getTeams<T>(): Promise<T> {
    return this.get<T>({
      pathParam: { "Teams": '' },
      param: { "format": "json" },
    }) as T
  }

  async getContext<T>(): Promise<T> {
    return this.get<T>({
      pathParam: { "Context": '' },
      param: { "format": "json", }
    }) as T
  }
}

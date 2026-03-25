import { Bug, UserStory, UserStoryComment, TpClientParameters, TestPlan, GeneralSearchResponse } from "./types.js";
import { config } from "./config.js";

export class TpClient {

  private baseUrl: string = config.tp.url
  private token: string = config.tp.token
  private headers: HeadersInit

  constructor() {
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  }

  private params(params: TpClientParameters): string {
    let _url = this.baseUrl
    for (const [key, value] of Object.entries(params.pathParam)) {
      _url += value ? `/${key}/${value}` : `/${key}`
    }

    let _urlParams = []
    for (const [key, value] of Object.entries(params.param)) {
      _urlParams.push(`${key}=${encodeURIComponent(value)}`)
    }
    return _url + "/?" + _urlParams.join("&")
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
    const response = await this.get<UserStory>({
      pathParam: {
        "userStories": userStoryId,
      },
      param: {
        "format": "json",
      }
    }) as T

    return response
  }

  async getBug<T>(bugId: string): Promise<T> {
    const response = await this.get<Bug>({
      pathParam: { "bugs": bugId },
      param: { "format": "json" }
    }) as T

    return response
  }

  async creteBug<T>(title: string, bugContent: string): Promise<T> {
    const bug = {
      "Name": title,
      "Project": {
        "Id": 59901
      },
      "customFields": [{
        "name": "Origin",
        "type": "DropDown",
        "value": "Manual QA"
      }],
      "assignedTeams": [{
        "team": {
          "id": 127065
        }
      }],
      "Description": bugContent,
    }

    return this.post<any, Bug>({
      pathParam: { "bugs": '' },
      param: { "format": "json" },
    }, bug) as T
  }

  async creteBugBasedOnCardId<T>(title: string, userStoryId: string, bugContent: string): Promise<T> {
    const bug = {
      "Name": title,
      "Project": {
        "Id": 59901
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
          "id": 127065
        }
      }],
      "Description": bugContent,
    }

    return this.post<any, Bug>({
      pathParam: { "bugs": '' },
      param: { "format": "json" },
    }, bug) as T
  }

  async creteTestPlan<T>(title: string, userStoryId: string): Promise<T> {
    const testPlan = {
      "Name": title,
      "Project": {
        "Id": 59901
      },
      "LinkedGeneral": {
        "ResourceType": "General",
        "Id": userStoryId,
        "Name": title,
      },
      "LinkedAssignable": {
        "ResourceType": "Assignable",
        "Id": userStoryId,
        "Name": title,
      },
      "LinkedUserStory": {
        "ResourceType": "UserStory",
        "Id": userStoryId,
        "Name": title,
      },
    }

    return this.post<any, TestPlan>({
      pathParam: { "testPlans": '' },
      param: { "format": "json" },
    }, testPlan) as T
  }

  async addComment<T>(userStoryId: string, comment: string): Promise<T> {
    const commentData = {
      description: comment,
      owner: {
        id: "1504",
      },
      general: {
        id: userStoryId,
      },
    }

    return this.post<any, UserStoryComment>({
      pathParam: { "comments": '' },
      param: { "format": "json" },
    }, commentData) as T
  }

  async searchContainsNameText<T>(text: string): Promise<T> {
    return this.get<GeneralSearchResponse>({
      pathParam: { "Generals": '' },
      param: {
        "format": "json",
        "take": "25",
        "where": `Name contains '${text}'`,
        "include": "[Name, Description, Id]"
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
}

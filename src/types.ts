/**
 * Every file in src/mcps/ must export a default value matching this shape.
 *
 * The app mounts it at  POST /mcp/:name
 * The manager connects to  http://localhost:{PORT}/mcp/:name
 */

// ── MCP types ───────────────────────────────────────────────────────────────────────
export interface Config {
  tp: {
    url: string;
    token: string;
    ownerId: string;
    projectId: string;
    teamId: string;
  }
}

// ── TP types ───────────────────────────────────────────────────────────────────────
export type TpClientParameters = {
  pathParam: { [key: string]: string | undefined }
  param: { [key: string]: string | number }
  apiVersion?: string
}

export interface TpResponse<T> {
  Next?: string
  Items: T[]
}

export interface GeneralSearchResponse {
  Next: string
  Items: General[]
}

export interface General {
  ResourceType: string
  Id: number
  Name: string
  Description: string
  StartDate: string
  EndDate: string
  CreateDate: string
  ModifyDate: string
  LastCommentDate: string
  Tags: string
  NumericPriority: number
  EntityVersion: number
  EntityType: EntityType
  LastEditor: LastEditor
  Owner: Owner
  Creator: Creator
  LastCommentedUser: LastCommentedUser
  Project: Project
  LinkedTestPlan: any
  Milestone: any
  CustomFields: CustomField[]
}

export interface Comment {
  ResourceType: string
  Id: number
  Description: string
  ParentId: any
  CreateDate: string
  DescriptionModifyDate: string
  IsPrivate: boolean
  IsPinned: boolean
  EntityVersion: number
  General: General
  Owner: Owner
}

export interface UserStory {
  ResourceType: string
  Id: number
  Name: string
  Description: string
  StartDate: string
  EndDate: any
  CreateDate: string
  ModifyDate: string
  LastCommentDate: string
  Tags: string
  NumericPriority: number
  EntityVersion: number
  EntityType: EntityType
  LastEditor: LastEditor
  Owner: Owner
  Creator: Creator
  LastCommentedUser: LastCommentedUser
  Project: Project
  LinkedTestPlan: any
  Milestone: any
  Effort: number
  EffortCompleted: number
  EffortToDo: number
  Progress: number
  TimeSpent: number
  TimeRemain: number
  LastStateChangeDate: string
  PlannedStartDate: any
  PlannedEndDate: any
  Units: string
  Release: Release
  Iteration: any
  TeamIteration: any
  Team: Team
  Priority: Priority
  EntityState: EntityState
  ResponsibleTeam: ResponsibleTeam
  InitialEstimate: number
  Feature: Feature
  Build: any
  CustomFields: CustomField[]
}

export interface LastCommentedUser {
  ResourceType: string
  Id: number
  FirstName: string
  LastName: string
  Login: string
  FullName: string
}

export interface Release {
  ResourceType: string
  Id: number
  Name: string
  Description: any
  StartDate: string
  EndDate: string
  CreateDate: string
  ModifyDate: string
  LastCommentDate: any
  Tags: string
  NumericPriority: number
  EntityVersion: number
  EntityType: EntityType
  LastEditor: LastEditor
  Owner: Owner
  Creator: Creator
  LastCommentedUser: any
  Project: Project
  LinkedTestPlan: any
  Milestone: any
  Effort: number
  EffortCompleted: number
  EffortToDo: number
  IsCurrent: boolean
  Progress: number
  Units: string
  Process: Process
  CustomFields: CustomField[]
}

export interface Bug {
  ResourceType: string
  Id: number
  Name: string
  Description: string
  StartDate: any
  EndDate: any
  CreateDate: string
  ModifyDate: string
  LastCommentDate: any
  Tags: string
  NumericPriority: number
  EntityVersion: number
  EntityType: EntityType
  LastEditor: LastEditor
  Owner: Owner
  Creator: Creator
  LastCommentedUser: any
  Project: Project
  LinkedTestPlan: any
  Milestone: any
  Effort: number
  EffortCompleted: number
  EffortToDo: number
  Progress: number
  TimeSpent: number
  TimeRemain: number
  LastStateChangeDate: string
  PlannedStartDate: any
  PlannedEndDate: any
  Units: string
  Release: any
  Iteration: any
  TeamIteration: any
  Team: Team
  Priority: Priority
  EntityState: EntityState
  ResponsibleTeam: ResponsibleTeam
  Build: any
  UserStory: UserStory
  Feature: Feature
  Severity: Severity
  CustomFields: CustomField[]
}

export interface Priority {
  ResourceType: string
  Id: number
  Name: string
  Importance: number
}

export interface Severity {
  ResourceType: string
  Id: number
  Name: string
  Importance: number
}

export interface Feature {
  ResourceType: string
  Id: number
  Name: string
  Description: string
  StartDate: any
  EndDate: any
  CreateDate: string
  ModifyDate: string
  LastCommentDate: any
  Tags: string
  NumericPriority: number
  EntityVersion: number
  EntityType: EntityType
  LastEditor: LastEditor
  Owner: Owner
  Creator: Creator
  LastCommentedUser: any
  Project: Project
  LinkedTestPlan: any
  Milestone: any
  Effort: number
  EffortCompleted: number
  EffortToDo: number
  Progress: number
  TimeSpent: number
  TimeRemain: number
  LastStateChangeDate: string
  PlannedStartDate: any
  PlannedEndDate: any
  Units: string
  Release: any
  Iteration: any
  TeamIteration: any
  Team: Team
  Priority: Priority
  EntityState: EntityState
  ResponsibleTeam: ResponsibleTeam
  InitialEstimate: number
  PortfolioEpic: PortfolioEpic
  Epic: Epic
  Build: any
  CustomFields: CustomField[]
}

export interface Owner {
  ResourceType: string
  Id: number
  FirstName: string
  LastName: string
  Login: string
  FullName: string
}

export interface Team {
  ResourceType: string
  Id: number
  Name: string
  EmojiIcon: string
}

export interface ResponsibleTeam {
  ResourceType: string
  Id: number
}

export interface PortfolioEpic {
  ResourceType: string
  Id: number
  Name: string
}

export interface Epic {
  ResourceType: string
  Id: number
  Name: string
}

export interface CustomField {
  Name: string
  Type: string
  Value: any
}

export interface TestPlan {
  ResourceType: string
  Id: number
  Name: string
  Description: any
  StartDate: any
  EndDate: any
  CreateDate: string
  ModifyDate: string
  LastCommentDate: any
  Tags: string
  NumericPriority: number
  EntityVersion: number
  EntityType: EntityType
  LastEditor: LastEditor
  Owner: Owner
  Creator: Creator
  LastCommentedUser: any
  Project: Project
  LinkedTestPlan: any
  Milestone: any
  Effort: number
  EffortCompleted: number
  EffortToDo: number
  Progress: number
  TimeSpent: number
  TimeRemain: number
  LastStateChangeDate: string
  PlannedStartDate: any
  PlannedEndDate: any
  Units: string
  Release: any
  Iteration: any
  TeamIteration: any
  Team: any
  Priority: Priority
  EntityState: EntityState
  ResponsibleTeam: any
  InitialEstimate: number
  CalculatedEstimate: any
  LinkedGeneral: LinkedGeneral
  LinkedAssignable: LinkedAssignable
  LinkedEpic: any
  LinkedFeature: any
  LinkedUserStory: LinkedUserStory
  LinkedTask: any
  LinkedBug: any
  LinkedRequest: any
  LinkedBuild: any
  LinkedRelease: any
  LinkedIteration: any
  LinkedTeamIteration: any
  CustomFields: any[]
}

export interface EntityType {
  ResourceType: string
  Id: number
  Name: string
  IsUnitInHourOnly: boolean
}

export interface LastEditor {
  ResourceType: string
  Id: number
  FirstName: string
  LastName: string
  Login: string
  FullName: string
}

export interface Creator {
  ResourceType: string
  Id: number
  FirstName: string
  LastName: string
  Login: string
  FullName: string
}

export interface Project {
  ResourceType: string
  Id: number
  Name: string
  Description: any
  StartDate: any
  EndDate: any
  CreateDate: string
  ModifyDate: string
  LastCommentDate: any
  Tags: string
  NumericPriority: number
  EntityVersion: number
  EntityType: EntityType
  LastEditor: LastEditor
  Owner: Owner
  Creator: Creator
  LastCommentedUser: any
  Project: any
  LinkedTestPlan: any
  Milestone: any
  Effort: number
  EffortCompleted: number
  EffortToDo: number
  IsActive: boolean
  IsProduct: boolean
  Abbreviation: string
  MailReplyAddress: any
  Color: any
  Progress: number
  PlannedStartDate: any
  PlannedEndDate: any
  LastStateChangeDate: string
  IsPrivate: any
  Units: string
  Program: any
  Process: Process
  EntityState: EntityState
  Company: Company
  CustomFields: any[]
}

export interface Company {
  ResourceType: string
  Id: number
  Name: string
}

export interface Process {
  ResourceType: string
  Id: number
}

export interface EntityState {
  ResourceType: string
  Id: number
  Name: string
  NumericPriority: number
}

export interface LinkedGeneral {
  ResourceType: string
  Id: number
  Name: string
}

export interface LinkedAssignable {
  ResourceType: string
  Id: number
  Name: string
}

export interface LinkedUserStory {
  ResourceType: string
  Id: number
  Name: string
}

export interface LoggedUser {
  ResourceType: string
  Id: number
  FirstName: string
  LastName: string
  Email: string
  IsActive: boolean
  IsAdministrator: boolean
  Kind: string
}

export interface TpResponseV2<TpResponseItemsV2> {
  items: TpResponseItemsV2[]
}

export interface TpResponseItemsV2<T> {
  items: T[]
}

export interface TpResultItemV2 {
  id: number
  name: string
  resourceType: string
}

export interface TpResultItemV2WithCustomFields {
  customFields: {
    type: string
    name: string
    value: string
  }[]
}

export interface Context {
  ResourceType: string
  Acid: string
  Edition: string
  Version: string
  IsFull: boolean
  AnyProject: boolean
  AnyTeam: boolean
  IsNoTeamIncluded: boolean
  LoggedUser: LoggedUser
  Culture: any
  SelectedProjects: any
  SelectedTeams: any
  Processes: any
  GlobalTerms: any
  AppContext: any
  CustomFields: any
}

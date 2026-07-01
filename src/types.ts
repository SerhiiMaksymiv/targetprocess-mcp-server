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

export interface BugInputSchema {
  title?: string,
  bugContent?: string,
  origin?: string,
  projectId?: string,
  teamId?: string,
  entityStateId?: string
}

export interface UserStoryInputSchema {
  title?: string,
  description?: string,
  projectId?: string,
  teamId?: string,
  entityStateId?: string
}

// ── TP types ───────────────────────────────────────────────────────────────────────
export type TpClientParameters = {
  pathParam: string[]
  param: { [key: string]: string | number }
  apiVersion?: string
}

export interface TpResponse<T> {
  Next: string
  Items: T[]
}

export type TpResult<U> =
  | { ok: true; data: U }
  | { ok: false; status: number; body: string }

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

export interface Task {
  ResourceType: string
  Id: number
  Name: string
  EntityState: EntityState
  UserStory: {
    ResourceType: string
    Id: number
    Name: string
    Feature: Feature | null
  } | null
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

export interface Assignable {
  ResourceType: string
  Id: number
  Name: string
}

export interface TeamAssignment {
  ResourceType: string
  Id: number
  StartDate: string
  EndDate: string
  Team: Team
  Assignable: Assignable
  EntityState: EntityState
}

export interface Team {
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
  Icon: any
  EmojiIcon: any
  IsActive: boolean
  Abbreviation: string
  CustomFields: any[]
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
  Priority: Priority
  EntityState: EntityState
  PortfolioEpic: PortfolioEpic
  CustomFields: CustomField[]
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

export interface EntityTypeV2 {
  resourceType: string
  id: number
  name: string
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

export interface ProcessListItem {
  ResourceType: string
  Id: number
  Name: string
  IsDefault: boolean
  Description: string | null
}

export interface ProcessV2 {
  resourceType: string
  id: number
  name: string
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

export interface TestCase {
  ResourceType: string
  Id: number
  Name: string
  Description: string
  CreateDate: string
  ModifyDate: string
  Project: Project
  LinkedTestPlan: TestPlan | null
}

export interface TestStep {
  ResourceType: string
  Id: number
  Description: string
  Result: string
  RunOrder: number
  TestCase: TestCase
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

export interface User {
  ResourceType: string
  Id: number
  FirstName: string
  LastName: string
  Email: string
  Login: string
  FullName: string
  CreateDate: string
  ModifyDate: string
  DeleteDate: any
  IsActive: boolean
  IsAdministrator: boolean
  Locale: any
  Kind: string
  GlobalId: string
  IsIntegration: boolean
  AccessStartDate: any
  AccessEndDate: any
  FrontdoorUserId: any
  FrontdoorUserRoles: any
  PasswordHashAlgorithm: string
  EntityVersion: number
  LastLoginDate: string
  WeeklyAvailableHours: number
  CurrentAllocation: number
  CurrentAvailableHours: any
  AvailableFrom: any
  AvailableFutureAllocation: any
  AvailableFutureHours: any
  IsObserver: boolean
  IsContributor: boolean
  LegacySkills: any
  ActiveDirectoryName: any
  RichEditor: string
  Role: Role
  CustomFields: CustomField[]
}

export interface Role {
  ResourceType: string
  Id: number
  Name: string
}

export interface TpResponseV2<TpResponseItemsV2> {
  next: string
  items: TpResponseItemsV2[]
}

export interface WorkflowV2 {
  id: number
  name: string
  process: string
  entityType: string
  entityStates: WorkflowEntityStateV2[]
}

export interface WorkflowV2WithSubStates {
  id: number
  name: string
  isInitial: boolean
  isFinal: boolean
  isDefaultFinal: boolean
  isPlanned: boolean
  workflow: WorkflowProcessV2
  entityType: EntityTypeV2
  subEntityStates: SubEntityStateV2[]
}

export interface WorkflowProcessV2 {
  id: number
  process: { id: number }
}

export interface SubEntityStateV2 {
  id: number
  name: string
  entityType: EntityTypeV2
  isInitial: boolean
  isFinal: boolean
  isDefaultFinal: boolean
  isPlanned: boolean
}

export interface WorkflowEntityStateV2 {
  id: number
  name: string
  numericPriority: number
  isInitial: boolean
  isFinal: boolean
  isDefaultFinal: boolean
  isPlanned: boolean
  isCommentRequired: boolean
  workflowId: number
  activeRoleId: number
  activeRoleName: string
}

export interface TpResponseItemsV2<T> {
  items: T[]
}

export interface TpResultItemV2 {
  id: number
  name: string
  resourceType: string
}

export interface GeneralV2 {
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

export interface CardStatusEntityState {
  id: number
  name: string
  nextStates: {
    items: GeneralV2[]
  }
  previousStates: {
    items: GeneralV2[]
  }
  workflowId: number
  subEntityStatesWorkflowIds: number[]
}

export interface CardStatusTeamEntityState {
  id: number
  name: string
  workflowId: number
}

export interface CardStatusTeamState {
  id: number
  team: {
    id: number
    name: string
    emojiIcon: string
  }
  entityState: CardStatusTeamEntityState
}

export interface CardStatusAssignedTeam {
  teamAssignmentId: number
  id: number
  name: string
  emojiIcon: string
}

export interface CardStatus {
  project: { id: number }
  entityState: CardStatusEntityState
  teamState: CardStatusTeamState
  teams: CardStatusAssignedTeam[]
}

export interface RelationType {
  ResourceType: string
  Id: number
  Name: string
}

export interface RelationEntity {
  ResourceType: string
  Id: number
  Name: string
  EntityType: EntityType
}

export interface Relation {
  ResourceType: string
  Id: number
  RelationType: RelationType
  Master: RelationEntity
  Slave: RelationEntity
}

export interface TimeLog {
  ResourceType: string
  Id: number
  Spent: number
  Date: string
  Description: string | null
  Assignable: {
    ResourceType: string
    Id: number
    Name: string
  }
  User: Owner
}

export interface RoleAssignment {
  ResourceType: string
  Id: number
  Assignable: Assignable
  GeneralUser: {
    ResourceType: string
    Id: number
    FirstName: string
    LastName: string
    Login: string
    FullName: string
  }
  Role: {
    ResourceType: string
    Id: number
    Name: string
  }
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

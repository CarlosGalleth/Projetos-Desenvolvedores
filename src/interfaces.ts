import { QueryResult } from "pg";

export interface IDeveloperData {
  name: string;
  email: string;
}
export interface IDeveloperDataResult extends IDeveloperData {
  id: number;
}
export type RequiredDeveloperKeys = "name" | "email";

export type IDeveloperDataQuery = QueryResult<IDeveloperDataResult>;

// --------------------------------------

export interface IDeveloperInfo {
  developerSince: string;
  preferredOS: string;
}

export type RequiredInfoKeys = "developerSince" | "preferredOS";

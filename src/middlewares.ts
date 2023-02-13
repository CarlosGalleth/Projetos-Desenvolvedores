import { NextFunction, request, Request, Response } from "express";
import { QueryConfig } from "pg";
import { client } from "./database";
import {
  RequiredDeveloperKeys,
  RequiredInfoKeys,
  RequiredProjectKeys,
} from "./interfaces";

export const ensureDataIsValid = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const developerEmail: string = request.body.email;
  const developerDataKeys: Array<string> = Object.keys(request.body);
  const requiredDataKeys: Array<RequiredDeveloperKeys> = ["name", "email"];

  const developerDataIsValid: boolean = requiredDataKeys.every((elem) => {
    return developerDataKeys.includes(elem);
  });

  if (!developerDataIsValid) {
    return response.status(400).json({
      message: `Required keys are ${requiredDataKeys}`,
    });
  }

  const queryString: string = `
    SELECT 
        *
    FROM
        developers
    WHERE
        email = $1
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developerEmail],
  };

  const queryResult = await client.query(queryConfig);

  if (queryResult.rowCount) {
    return response.status(409).json({
      message: "Email already in use",
    });
  }

  return next();
};

export const ensureDeveloperExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const requestId: number = Number(request.params.id);

  const queryString: string = `
    SELECT 
      *
    FROM
      developers
    WHERE
      id = $1
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [requestId],
  };

  const queryResult = await client.query(queryConfig);

  if (!queryResult.rows.length) {
    return response.status(404).json({
      message: "Developer not found",
    });
  }

  return next();
};

export const ensureInfoDataIsValid = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const infoDataKeys: Array<string> = Object.keys(request.body);
  const requiredInfoKeys: Array<RequiredInfoKeys> = [
    "developerSince",
    "preferredOS",
  ];

  const infoDataIsValid: boolean = requiredInfoKeys.every((elem) => {
    return infoDataKeys.includes(elem);
  });

  if (!infoDataIsValid) {
    return response.status(400).json({
      message: `Required keys are ${requiredInfoKeys}`,
    });
  }

  if (infoDataKeys.length > requiredInfoKeys.length) {
    return response.status(400).json({
      message: `Required keys are ${requiredInfoKeys}`,
    });
  }

  return next();
};

export const ensureDeveloperExistsFromProject = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const developerId: number = Number(request.body.developerId);

  const queryString: string = `
    SELECT
      *
    FROM
      developers
    WHERE
      id = $1
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developerId],
  };

  const queryResult = await client.query(queryConfig);

  if (!queryResult.rows[0]) {
    return response.status(404).json({
      message: "Developer not found",
    });
  }

  return next();
};

export const ensureProjectExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const projectId: number = Number(request.params.id);

  const queryString: string = `
    SELECT 
      *
    FROM
      projects
    WHERE
      id = $1
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId],
  };

  const queryResult = await client.query(queryConfig);

  if (!queryResult.rows[0]) {
    return response.status(404).json({
      message: "Project not found",
    });
  }

  return next();
};

export const ensureProjectDataIsValid = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const {
    name,
    description,
    estimatedTime,
    repository,
    startDate,
    endDate,
    developerId,
  } = request.body;

  request.projectData = {
    name,
    description,
    estimatedTime,
    repository,
    startDate,
    endDate,
    developerId,
  };

  const requiredProjectKeys: Array<RequiredProjectKeys> = [
    "name",
    "description",
    "estimatedTime",
    "repository",
    "startDate",
    "endDate",
    "developerId",
  ];

  const projectDataKeys: Array<string> = Object.keys(request.body);

  const teste: boolean = requiredProjectKeys.every((elem: string) => {
    return projectDataKeys.includes(elem);
  });

  if (!teste) {
    return response.status(400).json({
      message: `Required keys are: ${requiredProjectKeys}`,
    });
  }

  return next();
};

import { NextFunction, request, Request, Response } from "express";
import { QueryConfig } from "pg";
import { client } from "./database";
import { RequiredDeveloperKeys, RequiredInfoKeys } from "./interfaces";

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

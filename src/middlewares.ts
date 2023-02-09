import { NextFunction, Request, Response } from "express";
import { QueryConfig } from "pg";
import { client } from "./database";
import { RequiredDeveloperKeys } from "./interfaces";

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

  const queryString = `
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

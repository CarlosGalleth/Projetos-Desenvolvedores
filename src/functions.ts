import { Request, Response } from "express";
import format from "pg-format";
import { client } from "./database";
import {
  IDeveloperData,
  IDeveloperDataQuery,
  RequiredDeveloperKeys,
} from "./interfaces";

// POST ------------------------------------------------------------------
export const postNewDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const requiredKeys: Array<RequiredDeveloperKeys> = ["name", "email"];
  try {
    const developerData: IDeveloperData = request.body;
    const queryString = format(
      `
    INSERT INTO
        developers(%I)
    VALUES 
        (%L)
    RETURNING *;
  `,
      Object.keys(developerData),
      Object.values(developerData)
    );

    const queryResult: IDeveloperDataQuery = await client.query(queryString);

    return response.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.code === "42703") {
      response
        .status(409)
        .json({ message: `Required keys are: ${requiredKeys}` });
    }
    return error;
  }
};

// GET -------------------------------------------------------------------
export const getAllDevelopers = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryString = `
        SELECT
            *
        FROM
            developers
    `;

  const queryResult = await client.query(queryString);

  return response.status(200).json(queryResult.rows);
};

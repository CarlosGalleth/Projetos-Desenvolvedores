import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "./database";
import {
  IDeveloperData,
  IDeveloperDataQuery,
  IProjectData,
  RequiredDeveloperKeys,
} from "./interfaces";

// DEVELOPERS ------------------------------------------------------------
// POST ------------------------------------------------------------------
export const postNewDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const requiredKeys: Array<RequiredDeveloperKeys> = ["name", "email"];
  try {
    const developerData: IDeveloperData = request.body;
    const queryString: string = format(
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

export const postNewDeveloperInfo = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const requestId: number = Number(request.params.id);
  const developerData: IDeveloperData = request.body;
  let queryString: string = format(
    `
    INSERT INTO
        developer_infos(%I)
    VALUES
        (%L)
    RETURNING *;
    `,
    Object.keys(developerData),
    Object.values(developerData)
  );

  const queryResult = await client.query(queryString);
  queryString = `
    UPDATE
      developers
    SET
      "developerInfoId" = $1
    WHERE
      id = $2
    RETURNING *;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [queryResult.rows[0].id, requestId],
  };

  await client.query(queryConfig);

  return response.status(201).json(queryResult.rows[0]);
};

// GET -------------------------------------------------------------------
export const getAllDevelopers = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryString: string = `
    SELECT
      developers.*,
      dinf."developerSince",
      dinf."preferredOS"
    FROM 
      developers
    LEFT JOIN
      developer_infos dinf ON developers."developerInfoId" = dinf.id
  `;

  const queryResult = await client.query(queryString);

  return response.status(200).json(queryResult.rows);
};

export const getASingleDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const requestId: number = Number(request.params.id);

  const queryString: string = `
    SELECT
      developers.*,
      dinf."developerSince",
      dinf."preferredOS"
    FROM
      developers
    LEFT JOIN
      developer_infos dinf ON developers."developerInfoId" = dinf.id
    WHERE
     developers.id = $1
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [requestId],
  };

  const queryResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows[0]);
};

export const getDeveloperProjects = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const developerId: number = Number(request.params.id);

  const queryString: string = `
    SELECT
      *
    FROM
      projects
    WHERE 
      "developerId" = $1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developerId],
  };

  const queryResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows);
};

// PATCH -----------------------------------------------------------------

export const patchDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const requestId: number = Number(request.params.id);
  const developerKeys: Array<string> = Object.keys(request.body);
  const developerValues: Array<string> = Object.values(request.body);
  const requiredKeys: Array<RequiredDeveloperKeys> = ["name", "email"];

  if (developerKeys.length > requiredKeys.length) {
    return response
      .status(400)
      .json({ message: `Required keys are: ${requiredKeys}` });
  }

  const queryString: string = format(
    `
    UPDATE
      developers
    SET
      (%I) = row (%L) 
    WHERE
      id = $1
    RETURNING *;
  `,
    developerKeys,
    developerValues
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [requestId],
  };

  const queryResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows[0]);
};

export const patchDeveloperInfo = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const requestId: number = Number(request.params.id);
  const developerKeys: Array<string> = Object.keys(request.body);
  const developerValues: Array<string> = Object.values(request.body);
  const requiredKeys: Array<RequiredDeveloperKeys> = ["name", "email"];

  const includesOS: boolean = developerValues.includes(
    "Linux" || "Windows" || "MacOS"
  );

  if (!includesOS) {
    return response.status(400).json({
      message: "PreferredOS value needs to be Windows or Linux or MacOS",
    });
  }

  if (developerKeys.length > requiredKeys.length) {
    return response
      .status(400)
      .json({ message: `Required keys are: ${requiredKeys}` });
  }

  const getQueryString: string = `
    SELECT
      *
    FROM
      developers
    WHERE
      id = $1
  `;

  const getQueryConfig: QueryConfig = {
    text: getQueryString,
    values: [requestId],
  };

  const getQueryResult = await client.query(getQueryConfig);

  const updateQueryString: string = format(
    `
    UPDATE
      developer_infos
    SET
      (%I) = row (%L)
    WHERE
      id = $1
    RETURNING *;
  `,
    developerKeys,
    developerValues
  );

  const updateQueryConfig: QueryConfig = {
    text: updateQueryString,
    values: [getQueryResult.rows[0].developerInfoId],
  };

  const updateQueryResult = await client.query(updateQueryConfig);

  return response.status(200).json(updateQueryResult.rows[0]);
};
// DELETE ----------------------------------------------------------------

export const deleteDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const requestId: number = Number(request.params.id);

  const queryString: string = `
    DELETE FROM
      developers
    WHERE
      id = $1
  `;

  const getQueryString: string = `
    SELECT
      *
    FROM
      developers
    WHERE
      id = $1
  `;

  const getQueryConfig: QueryConfig = {
    text: getQueryString,
    values: [requestId],
  };
  const getQueryResult = await client.query(getQueryConfig);

  const queryStringInfo: string = `
    DELETE FROM
      developer_infos
    WHERE
      id = $1
  `;

  const queryConfigInfo: QueryConfig = {
    text: queryStringInfo,
    values: [getQueryResult.rows[0].developerInfoId],
  };

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [requestId],
  };

  await client.query(queryConfig);
  await client.query(queryConfigInfo);

  return response.status(204).json();
};

// PROJECTS --------------------------------------------------------------
// POST ------------------------------------------------------------------

export const postNewProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const projectData: IProjectData = request.projectData;

  const queryString: string = format(
    `
    INSERT INTO
      projects(%I) 
    VALUES 
      (%L)
    RETURNING *;
  `,
    Object.keys(projectData),
    Object.values(projectData)
  );

  const queryResult = await client.query(queryString);

  return response.status(201).json(queryResult.rows[0]);
};

export const postNewTechnology = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const projectId: number = Number(request.params.id);
  const technologyData = request.body;

  const { technologyName } = technologyData;

  request.technologyData = {
    technologyName,
  };

  const getProjectQueryString: string = `
    SELECT
      *
    FROM
      projects
    WHERE
      id = $1
  `;

  const getProjectQueryConfig: QueryConfig = {
    text: getProjectQueryString,
    values: [projectId],
  };

  const getProjectQueryResult = await client.query(getProjectQueryConfig);

  const getTechQueryString: string = `
    SELECT
      *
    FROM
      technologies
    WHERE
      "technologyName" = $1
  `;

  const getTechQueryConfig: QueryConfig = {
    text: getTechQueryString,
    values: [technologyName],
  };

  const getTechQueryResult = await client.query(getTechQueryConfig);

  if (!getTechQueryResult.rowCount) {
    return response.status(400).json({
      message: "Wrong technology",
    });
  }

  const queryString: string = `
    INSERT INTO
      projects_technologies ("addedIn","projectId","technologyId")
    VALUES
      ($1, $2, $3)
    RETURNING *;
  `;

  const date: Date = new Date(Date.now() + 86400 * 1000);

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [
      date,
      getProjectQueryResult.rows[0].id,
      getTechQueryResult.rows[0].id,
    ],
  };

  const queryResult = await client.query(queryConfig);

  return response.status(201).json(queryResult.rows[0]);
};

// GET -------------------------------------------------------------------

export const getAllProjects = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryString: string = `
    SELECT
      *
    FROM
      projects
  `;

  const queryResult = await client.query(queryString);

  return response.status(200).json(queryResult.rows);
};

export const getASingleProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
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

  return response.status(200).json(queryResult.rows[0]);
};
// PATCH -----------------------------------------------------------------

export const patchProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const projectData = request.projectData;
  const projectId: number = Number(request.params.id);

  const queryString: string = format(
    `
    UPDATE
      projects
    SET
      (%I) = row (%L)
    WHERE
      id = $1
    RETURNING *;
  `,
    Object.keys(projectData),
    Object.values(projectData)
  );
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId],
  };

  const queryResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows[0]);
};
// DELETE ----------------------------------------------------------------

export const deleteProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const projectId: number = Number(request.params.id);

  const queryString: string = `
    DELETE FROM
      projects
    WHERE
      id = $1
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId],
  };

  await client.query(queryConfig);

  return response.status(204).json();
};

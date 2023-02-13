import express, { Application, Request, Response } from "express";
import { startDatabase } from "./database/index";
import {
  deleteDeveloper,
  deleteProject,
  getAllDevelopers,
  getAllProjects,
  getASingleDeveloper,
  getASingleProject,
  getDeveloperProjects,
  patchDeveloper,
  patchDeveloperInfo,
  patchProject,
  postNewDeveloper,
  postNewDeveloperInfo,
  postNewProject,
  postNewTechnology,
} from "./functions";
import {
  ensureDataIsValid,
  ensureDeveloperExists,
  ensureDeveloperExistsFromProject,
  ensureInfoDataIsValid,
  ensureProjectDataIsValid,
  ensureProjectExists,
} from "./middlewares";
const app: Application = express();
app.use(express.json());

// Developers -----------------------------------------------

app.post("/developers", ensureDataIsValid, postNewDeveloper); //
app.post("/developers/:id/infos", ensureInfoDataIsValid, postNewDeveloperInfo); //

app.get("/developers", getAllDevelopers); //
app.get("/developers/:id", ensureDeveloperExists, getASingleDeveloper); //
app.get(
  "/developers/:id/projects",
  ensureDeveloperExists,
  getDeveloperProjects
); //

app.patch(
  "/developers/:id",
  ensureDeveloperExists,
  ensureDataIsValid,
  patchDeveloper
); //
app.patch("/developers/:id/infos", patchDeveloperInfo); //

app.delete("/developers/:id", ensureDeveloperExists, deleteDeveloper); //

// Projects -------------------------------------------------

app.post(
  "/projects",
  ensureDeveloperExistsFromProject,
  ensureProjectDataIsValid,
  postNewProject
); //
app.post("/projects/:id/technologies", ensureProjectExists, postNewTechnology); //

app.get("/projects", getAllProjects); //
app.get("/projects/:id", ensureProjectExists, getASingleProject); //

app.patch("/projects/:id", ensureProjectDataIsValid, patchProject); //

app.delete("/projects/:id", ensureProjectExists, deleteProject); //
app.delete("/projects/:id/technologies/:name");

// ----------------------------------------------------------
app.listen(3000, async () => {
  await startDatabase();
  console.log("Server is running!");
});

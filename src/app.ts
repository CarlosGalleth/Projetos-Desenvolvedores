import express, { Application, Request, Response } from "express";
import { startDatabase } from "./database";
import {
  deleteDeveloper,
  getAllDevelopers,
  getASingleDeveloper,
  patchDeveloper,
  patchDeveloperInfo,
  postNewDeveloper,
  postNewDeveloperInfo,
} from "./functions";
import {
  ensureDataIsValid,
  ensureDeveloperExists,
  ensureInfoDataIsValid,
} from "./middlewares";
const app: Application = express();
app.use(express.json());

// Developers -----------------------------------------------

app.post("/developers", ensureDataIsValid, postNewDeveloper); //
app.post("/developers/:id/infos", ensureInfoDataIsValid, postNewDeveloperInfo); //

app.get("/developers", getAllDevelopers); //
app.get("/developers/:id", ensureDeveloperExists, getASingleDeveloper); //
app.get("/developers/:id/projects");

app.patch(
  "/developers/:id",
  ensureDeveloperExists,
  ensureDataIsValid,
  patchDeveloper
); //
app.patch("/developers/:id/infos", ensureInfoDataIsValid, patchDeveloperInfo); //

app.delete("/developers/:id", ensureDeveloperExists, deleteDeveloper); //

// Projects -------------------------------------------------

app.post("/projects");
app.post("/projects/:id/technologies");

app.get("/projects");
app.get("/projects/:id");

app.patch("/projects/:id");

app.delete("/projects/:id");
app.delete("/projects/:id/technologies/:name");

// ----------------------------------------------------------
app.listen(3000, async () => {
  await startDatabase();
  console.log("Server is running!");
});

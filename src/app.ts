import express, { Application, Request, Response } from "express";
import { startDatabase } from "./database";
import { getAllDevelopers, postNewDeveloper } from "./functions";
import { ensureDataIsValid } from "./middlewares";
const app: Application = express();
app.use(express.json());

// Developers -----------------------------------------------

app.post("/developers", ensureDataIsValid, postNewDeveloper);
app.post("/developers/:id/infos");

app.get("/developers", getAllDevelopers);
app.get("/developers/:id");
app.get("/developers/:id/projects");

app.patch("/developers/:id");
app.patch("/developers/:id/infos");

app.delete("/developers/:id");

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

import { client } from "./database";

export const startDatabase = async (): Promise<void> => {
  await client.connect();
  console.log("database connected");
};

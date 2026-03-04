import dotenv from "dotenv";
import { createApp } from "./app";

dotenv.config();

const app = createApp();
const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`[backend] listening on http://localhost:${port}`);
});

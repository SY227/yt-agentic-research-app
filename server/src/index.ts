--------------------------------------------------
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();
if (!process.env.FMP_API_KEY) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  dotenv.config({ path: join(__dirname, "../.env") });
}

import earningsRouter from "./routes/earnings.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api/earnings", earningsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



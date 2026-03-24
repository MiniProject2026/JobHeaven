import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();
app.listen(() => {
  console.log(`Job service is running on http://localhost:${process.env.PORT}`);
});

import express from "express";
import { handler as ssrHandler } from "./dist/server/entry.mjs";

const app = express();
const base = "/";

// Add VPFS headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

app.use(base, express.static("dist/client/"));
app.use(ssrHandler);

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

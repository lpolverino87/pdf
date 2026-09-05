import path from "node:path";
import express from "express";
import app from "./app";

const frontendDist = path.resolve(
  process.cwd(),
  "artifacts/comuni-app/dist/public",
);

app.use(express.static(frontendDist));
app.use((req, res, next) => {
  if (req.path === "/api" || req.path.startsWith("/api/")) {
    next();
    return;
  }

  res.sendFile(path.join(frontendDist, "index.html"), (error) => {
    if (error) {
      next(error);
    }
  });
});

export default app;
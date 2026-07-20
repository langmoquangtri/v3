import fs from "fs";
import path from "path";

const cjsPath = path.join(process.cwd(), "frontend", "dist", "server.cjs");

if (fs.existsSync(cjsPath)) {
  import("./frontend/dist/server.cjs");
} else {
  import("./frontend/server.ts");
}

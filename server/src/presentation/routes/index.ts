import { Router } from "express";
import { VersionConfig, versionMiddleware } from "../middlewares/version.middleware";
import v1Router from "./v1";

// To deprecate a version: set deprecated: true, add sunsetDate and successorVersion.
// To add a new version: import its router and add an entry here.
const versions: Record<string, { router: Router; config: VersionConfig }> = {
  v1: {
    router: v1Router,
    config: {
      deprecated: false,
      // deprecated: true,
      // sunsetDate: "2027-01-01",
      // successorVersion: "v2",
    },
  },
};

const apiRouter = Router();

for (const [version, { router, config }] of Object.entries(versions)) {
  apiRouter.use(`/${version}`, versionMiddleware(config), router);
}

export default apiRouter;

import { Request, Response, NextFunction } from "express";

export interface VersionConfig {
  deprecated: boolean;
  sunsetDate?: string; // ISO date — when the version will be shut down
  successorVersion?: string; // e.g. "v2"
}

export function versionMiddleware(config: VersionConfig) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (config.deprecated) {
      res.setHeader("Deprecation", "true");

      if (config.sunsetDate) {
        res.setHeader("Sunset", new Date(config.sunsetDate).toUTCString());
      }

      if (config.successorVersion) {
        const baseUrl = `${_req.protocol}://${_req.get("host")}`;
        res.setHeader(
          "Link",
          `<${baseUrl}/api/${config.successorVersion}>; rel="successor-version"`,
        );
      }
    }
    next();
  };
}

import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      projectData: {
        name: string;
        description: string;
        estimatedTime: string;
        repository: string;
        startDate: Date;
        endDate: Date;
        developerId: number;
      };
    }
  }
}

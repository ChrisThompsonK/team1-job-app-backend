import "express";

// Extend Express Request interface to include Multer file support
declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
      files?: { [fieldname: string]: Multer.File[] } | Multer.File[];
    }
  }
}

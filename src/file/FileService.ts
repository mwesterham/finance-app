import * as fs from 'fs';
import * as path from 'path';

export class FileService {
  /**
   * Ensures a directory exists. Creates it recursively if it does not.
   * @param dirPath The path to the directory
   */
  static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    } else {
      console.log(`Directory already exists: ${dirPath}`);
    }
  }

  /**
   * Returns a list of filenames (not directories) in a given directory.
   * @param dirPath The path to the directory
   * @returns Array of filenames
   */
  static getFilenamesInDirectory(dirPath: string): string[] {
    return fs.readdirSync(dirPath).filter((file) => {
      const fullPath = path.join(dirPath, file);
      return fs.statSync(fullPath).isFile();
    });
  }

  static getOrCreateDbFilePath(dbsTargetPath: string, rawName: string): string {
    FileService.ensureDirectoryExists(dbsTargetPath);
    return `${dbsTargetPath}\\${rawName}`;
  }
}

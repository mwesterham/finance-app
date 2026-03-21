import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { FileService } from './FileService';

export class BackupService {
  /**
   * Creates a backup of the database file in a date-partitioned backup directory.
   * Failures are caught and logged; never throws.
   * @param dbPath Absolute path to the database file
   */
  static backup(dbPath: string): void {
    try {
      // Construct backup directory path with today's date
      const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const backupDir = path.join(
        app.getPath('userData'),
        'financeApp',
        'backups',
        'dbs',
        dateStr
      );

      // Ensure backup directory exists
      FileService.ensureDirectoryExists(backupDir);

      // Construct timestamped destination filename
      const ext = path.extname(dbPath); // e.g., ".db"
      const stem = path.basename(dbPath, ext); // e.g., "default"
      const timestamp = new Date()
        .toISOString()
        .slice(0, 16)
        .replace(/:/g, '-'); // YYYY-MM-DDTHH-mm
      const destFilename = `${stem}_${timestamp}${ext}`;
      const dest = path.join(backupDir, destFilename);

      // Copy the database file
      fs.copyFileSync(dbPath, dest);
    } catch (error) {
      console.error('BackupService: Failed to create backup', error);
    }
  }
}

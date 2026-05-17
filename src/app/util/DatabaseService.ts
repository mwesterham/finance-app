import {
  DeleteRowFromDatabaseProps,
  GetDbLocalPathProps,
  OnDeleteRowFromDatabaseResult,
  OnGetDbLocalPathResult,
  OnReadDatabaseRowsResult,
  OnUpdateRowInDatabaseResult,
  WriteRowToDatabaseIfMissingProps,
  OnWriteRowToDatabaseIfMissingResult,
  WriteRowToDatabaseProps,
  OnWriteRowToDatabaseResult,
  ReadDatabaseRowsProps,
  UpdateRowInDatabaseProps,
  ReadEmptyCategoryDatabaseRowsProps,
  OnReadEmptyCategoryDatabaseRowsResult,
  ReadDatabaseRulesProps,
  OnReadDatabaseRulesResult,
  WriteDatabaseRulesProps,
  OnWriteDatabaseRulesResult,
  DeleteDatabaseRulesProps,
  OnDeleteDatabaseRulesResult,
  UpdateRuleInDatabaseProps,
  OnUpdateRuleInDatabaseResult,
  GetDistinctValuesOfColumnProps,
  OnGetDistinctValuesOfColumnResult,
  GetAllExistingDatabasesProps,
  OnGetAllExistingDatabasesResult,
  AttachDatabaseProps,
  OnAttachDatabaseResult,
  ReadFileTypesProps,
  OnReadFileTypesResult,
  WriteFileTypeProps,
  OnWriteFileTypeResult,
  DeleteFileTypeProps,
  OnDeleteFileTypeResult,
  UpdateFileTypeProps,
  OnUpdateFileTypeResult,
  OpenDbDirectoryProps,
  OnOpenDbDirectoryResult,
  OpenBackupsDirectoryProps,
  OnOpenBackupsDirectoryResult,
} from "../../preload";

export default class DatabaseService {
  static readDatabaseRows(
    props?: ReadDatabaseRowsProps
  ): Promise<OnReadDatabaseRowsResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnReadDatabaseRowsResult) => {
        window.electronAPI.detachOnReadDatabaseRows();
        resolve(result);
      };
      window.electronAPI.onReadDatabaseRows(handler);
      window.electronAPI.readDatabaseRows(props);
    });
  }

  static writeRowToDatabase(
    props: WriteRowToDatabaseProps
  ): Promise<OnWriteRowToDatabaseResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnWriteRowToDatabaseResult) => {
        window.electronAPI.detachOnWriteRowToDatabase();
        resolve(result);
      };
      window.electronAPI.onWriteRowToDatabase(handler);
      window.electronAPI.writeRowToDatabase(props);
    });
  }

  static deleteRowFromDatabase(
    props: DeleteRowFromDatabaseProps
  ): Promise<OnDeleteRowFromDatabaseResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnDeleteRowFromDatabaseResult) => {
        window.electronAPI.detachOnDeleteRowFromDatabase();
        resolve(result);
      };
      window.electronAPI.onDeleteRowFromDatabase(handler);
      window.electronAPI.deleteRowFromDatabase(props);
    });
  }

  static writeRowToDatabaseIfMissing(
    props?: WriteRowToDatabaseIfMissingProps
  ): Promise<OnWriteRowToDatabaseIfMissingResult> {
    return new Promise((resolve) => {
      const handler = (
        event: any,
        result: OnWriteRowToDatabaseIfMissingResult
      ) => {
        window.electronAPI.detachOnWriteRowToDatabaseIfMissing();
        resolve(result);
      };
      window.electronAPI.onWriteRowToDatabaseIfMissing(handler);
      window.electronAPI.writeRowToDatabaseIfMissing(props);
    });
  }

  static readEmptyCategoryDatabaseRows(
    props?: ReadEmptyCategoryDatabaseRowsProps
  ): Promise<OnReadEmptyCategoryDatabaseRowsResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnReadEmptyCategoryDatabaseRowsResult) => {
        window.electronAPI.detachOnReadEmptyCategoryDatabaseRows();
        resolve(result);
      };
      window.electronAPI.onReadEmptyCategoryDatabaseRows(handler);
      window.electronAPI.readEmptyCategoryDatabaseRows(props);
    });
  }

  static getDbLocalPath(
    props?: GetDbLocalPathProps
  ): Promise<OnGetDbLocalPathResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnGetDbLocalPathResult) => {
        window.electronAPI.detachOnGetDbLocalPath();
        resolve(result);
      };
      window.electronAPI.onGetDbLocalPath(handler);
      window.electronAPI.getDbLocalPath(props);
    });
  }

  static updateRowInDatabase(
    props?: UpdateRowInDatabaseProps
  ): Promise<OnUpdateRowInDatabaseResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnUpdateRowInDatabaseResult) => {
        window.electronAPI.detachOnUpdateRowInDatabase();
        resolve(result);
      };
      window.electronAPI.onUpdateRowInDatabase(handler);
      window.electronAPI.updateRowInDatabase(props);
    });
  }

  static readDatabaseRules(
    props?: ReadDatabaseRulesProps
  ): Promise<OnReadDatabaseRulesResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnReadDatabaseRulesResult) => {
        window.electronAPI.detachOnReadDatabaseRules();
        resolve(result);
      };
      window.electronAPI.onReadDatabaseRules(handler);
      window.electronAPI.readDatabaseRules(props);
    });
  }

  static writeRuleToDatabase(
    props: WriteDatabaseRulesProps
  ): Promise<OnWriteDatabaseRulesResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnWriteDatabaseRulesResult) => {
        window.electronAPI.detachOnWriteDatabaseRules();
        resolve(result);
      };
      window.electronAPI.onWriteDatabaseRules(handler);
      window.electronAPI.writeDatabaseRules(props);
    });
  }

  static deleteRuleFromDatabase(
    props: DeleteDatabaseRulesProps
  ): Promise<OnDeleteDatabaseRulesResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnDeleteDatabaseRulesResult) => {
        window.electronAPI.detachOnDeleteDatabaseRules();
        resolve(result);
      };
      window.electronAPI.onDeleteDatabaseRules(handler);
      window.electronAPI.deleteDatabaseRules(props);
    });
  }

  static updateRuleInDatabase(
    props?: UpdateRuleInDatabaseProps
  ): Promise<OnUpdateRuleInDatabaseResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnUpdateRuleInDatabaseResult) => {
        window.electronAPI.detachOnUpdateRuleInDatabase();
        resolve(result);
      };
      window.electronAPI.onUpdateRuleInDatabase(handler);
      window.electronAPI.updateRuleInDatabase(props);
    });
  }

  static getDistinctValuesOfColumn(
    props?: GetDistinctValuesOfColumnProps
  ): Promise<OnGetDistinctValuesOfColumnResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnGetDistinctValuesOfColumnResult) => {
        window.electronAPI.detachOnGetDistinctValuesOfColumn();
        resolve(result);
      };
      window.electronAPI.onGetDistinctValuesOfColumn(handler);
      window.electronAPI.getDistinctValuesOfColumn(props);
    });
  }

  static getAllExistingDatabases(
    props?: GetAllExistingDatabasesProps
  ): Promise<OnGetAllExistingDatabasesResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnGetAllExistingDatabasesResult) => {
        window.electronAPI.detachOnGetAllExistingDatabases();
        resolve(result);
      };
      window.electronAPI.onGetAllExistingDatabases(handler);
      window.electronAPI.getAllExistingDatabases(props);
    });
  }

  static attachDatabase(
    props?: AttachDatabaseProps
  ): Promise<OnAttachDatabaseResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnAttachDatabaseResult) => {
        window.electronAPI.detachOnAttachDatabase();
        resolve(result);
      };
      window.electronAPI.onAttachDatabase(handler);
      window.electronAPI.attachDatabase(props);
    });
  }

  // ─── File Types ─────────────────────────────────────────────────────────────

  static readFileTypes(
    props?: ReadFileTypesProps
  ): Promise<OnReadFileTypesResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnReadFileTypesResult) => {
        window.electronAPI.detachOnReadFileTypes();
        resolve(result);
      };
      window.electronAPI.onReadFileTypes(handler);
      window.electronAPI.readFileTypes(props);
    });
  }

  static writeFileType(
    props: WriteFileTypeProps
  ): Promise<OnWriteFileTypeResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnWriteFileTypeResult) => {
        window.electronAPI.detachOnWriteFileType();
        resolve(result);
      };
      window.electronAPI.onWriteFileType(handler);
      window.electronAPI.writeFileType(props);
    });
  }

  static deleteFileType(
    props: DeleteFileTypeProps
  ): Promise<OnDeleteFileTypeResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnDeleteFileTypeResult) => {
        window.electronAPI.detachOnDeleteFileType();
        resolve(result);
      };
      window.electronAPI.onDeleteFileType(handler);
      window.electronAPI.deleteFileType(props);
    });
  }

  static updateFileType(
    props: UpdateFileTypeProps
  ): Promise<OnUpdateFileTypeResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnUpdateFileTypeResult) => {
        window.electronAPI.detachOnUpdateFileType();
        resolve(result);
      };
      window.electronAPI.onUpdateFileType(handler);
      window.electronAPI.updateFileType(props);
    });
  }

  static openDbDirectory(
    props?: OpenDbDirectoryProps
  ): Promise<OnOpenDbDirectoryResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnOpenDbDirectoryResult) => {
        window.electronAPI.detachOnOpenDbDirectory();
        resolve(result);
      };
      window.electronAPI.onOpenDbDirectory(handler);
      window.electronAPI.openDbDirectory(props);
    });
  }

  static openBackupsDirectory(
    props?: OpenBackupsDirectoryProps
  ): Promise<OnOpenBackupsDirectoryResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnOpenBackupsDirectoryResult) => {
        window.electronAPI.detachOnOpenBackupsDirectory();
        resolve(result);
      };
      window.electronAPI.onOpenBackupsDirectory(handler);
      window.electronAPI.openBackupsDirectory(props);
    });
  }
}

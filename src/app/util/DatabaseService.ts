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
} from "../../preload";

export default class DatabaseService {
  static readDatabaseRows(
    props?: ReadDatabaseRowsProps
  ): Promise<OnReadDatabaseRowsResult> {
    return new Promise((resolve) => {
      const handler = (event: any, result: OnReadDatabaseRowsResult) => {
        window.electronAPI.detachOnReadDatabaseRows(handler);
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
        window.electronAPI.detachOnWriteRowToDatabase(handler);
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
        window.electronAPI.detachOnDeleteRowFromDatabase(handler);
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
        window.electronAPI.detachOnWriteRowToDatabaseIfMissing(handler);
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
        window.electronAPI.detachOnReadEmptyCategoryDatabaseRows(handler);
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
        window.electronAPI.detachOnGetDbLocalPath(handler);
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
        window.electronAPI.detachOnUpdateRowInDatabase(handler);
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
        window.electronAPI.detachOnReadDatabaseRules(handler);
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
        window.electronAPI.detachOnWriteDatabaseRules(handler);
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
        window.electronAPI.detachOnDeleteDatabaseRules(handler);
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
        window.electronAPI.detachOnUpdateRuleInDatabase(handler);
        resolve(result);
      };
      window.electronAPI.onUpdateRuleInDatabase(handler);
      window.electronAPI.updateRuleInDatabase(props);
    });
  }
}

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
}

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import {ipcRenderer, contextBridge} from "electron";
import { FinanceSheetRow } from "./db/WesterhamDatabase";

// Declare types globally
declare global {
  interface Window { 
    electronAPI: typeof electronAPI
  }
}

interface Result {
  err?: any;
}

export interface ReadDatabaseRowsProps {
}
export interface OnReadDatabaseRowsResult extends Result {
  rows: FinanceSheetRow[];
}

export interface WriteRowToDatabaseProps {
  row: FinanceSheetRow;
}
export interface OnWriteRowToDatabaseResult extends Result {
  data: any;
  newTransactionId: number;
}

export interface DeleteRowFromDatabaseProps {
  transactionId: number;
}
export interface OnDeleteRowFromDatabaseResult extends Result {
  deletedId: number;
  deleted: boolean;
}

export interface ReadEmptyCategoryDatabaseRowsProps {
}
export interface OnReadEmptyCategoryDatabaseRowsResult extends Result {
  rows: FinanceSheetRow[];
}

export interface WriteRowToDatabaseIfMissingProps {
  rows: FinanceSheetRow[];
}
export interface OnWriteRowToDatabaseIfMissingResult extends Result {
  requestedRowCount: number;
  writtenRowCount: number;
  oldLastTransactionId: number;
  newLastTransactionId: number;
}

export interface GetDbLocalPathProps {
}
export interface OnGetDbLocalPathResult extends Result {
  path: string;
}

export interface UpdateRowInDatabaseProps {
  transactionId: string;
  row: FinanceSheetRow;
}
export interface OnUpdateRowInDatabaseResult extends Result {
  data: any;
}

const electronAPI = {
  readDatabaseRows: async (props?: ReadDatabaseRowsProps) => ipcRenderer.send('readDatabaseRows', props),
  onReadDatabaseRows: (callback: (event: any, values: OnReadDatabaseRowsResult) => void) => 
    ipcRenderer.on('readDatabaseRowsResult', callback),
  detachOnReadDatabaseRows: (callback: (event: any, values: OnReadDatabaseRowsResult) => void) => 
    ipcRenderer.removeListener('readDatabaseRowsResult', callback),

  writeRowToDatabase: async (props: WriteRowToDatabaseProps) => ipcRenderer.send('writeRowToDatabase', props),
  onWriteRowToDatabase: (callback: (event: any, values: OnWriteRowToDatabaseResult) => void) => 
    ipcRenderer.on('writeRowToDatabaseResult', callback),
  detachOnWriteRowToDatabase: (callback: (event: any, values: OnWriteRowToDatabaseResult) => void) => 
    ipcRenderer.removeListener('writeRowToDatabaseResult', callback),

  deleteRowFromDatabase: async (props: DeleteRowFromDatabaseProps) => ipcRenderer.send('deleteRowFromDatabase', props),
  onDeleteRowFromDatabase: (callback: (event: any, values: OnDeleteRowFromDatabaseResult) => void) => 
    ipcRenderer.on('deleteRowFromDatabaseResult', callback),
  detachOnDeleteRowFromDatabase: (callback: (event: any, values: OnDeleteRowFromDatabaseResult) => void) => 
    ipcRenderer.removeListener('deleteRowFromDatabaseResult', callback),

  writeRowToDatabaseIfMissing: async (props?: WriteRowToDatabaseIfMissingProps) => ipcRenderer.send('writeRowToDatabaseIfMissing', props),
  onWriteRowToDatabaseIfMissing: (callback: (event: any, values: OnWriteRowToDatabaseIfMissingResult) => void) => 
    ipcRenderer.on('writeRowToDatabaseIfMissingResult', callback),
  detachOnWriteRowToDatabaseIfMissing: (callback: (event: any, values: OnWriteRowToDatabaseIfMissingResult) => void) => 
    ipcRenderer.removeListener('writeRowToDatabaseIfMissingResult', callback),

  readEmptyCategoryDatabaseRows: async (props?: ReadEmptyCategoryDatabaseRowsProps) => ipcRenderer.send('readEmptyCategoryDatabaseRows', props),
  onReadEmptyCategoryDatabaseRows: (callback: (event: any, values: OnReadEmptyCategoryDatabaseRowsResult) => void) => 
    ipcRenderer.on('readEmptyCategoryDatabaseRowsResult', callback),
  detachOnReadEmptyCategoryDatabaseRows: (callback: (event: any, values: OnReadEmptyCategoryDatabaseRowsResult) => void) => 
    ipcRenderer.on('readEmptyCategoryDatabaseRowsResult', callback),

  getDbLocalPath: async (props?: GetDbLocalPathProps) => ipcRenderer.send('getDbLocalPath', props),
  onGetDbLocalPath: (callback: (event: any, values: OnGetDbLocalPathResult) => void) => 
    ipcRenderer.on('getDbLocalPathResult', callback),
  detachOnGetDbLocalPath: (callback: (event: any, values: OnGetDbLocalPathResult) => void) => 
    ipcRenderer.removeListener('getDbLocalPathResult', callback),

  updateRowInDatabase: async (props?: UpdateRowInDatabaseProps) => ipcRenderer.send('updateRowInDatabase', props),
  onUpdateRowInDatabase: (callback: (event: any, values: OnUpdateRowInDatabaseResult) => void) => 
    ipcRenderer.on('onUpdateRowInDatabase', callback),
  detachOnUpdateRowInDatabase: (callback: (event: any, values: OnUpdateRowInDatabaseResult) => void) => 
    ipcRenderer.removeListener('onUpdateRowInDatabase', callback),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
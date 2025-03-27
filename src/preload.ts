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
}

export interface DeleteRowFromDatabaseProps {
  transactionId: number;
}
export interface OnDeleteRowFromDatabaseResult extends Result {
  data: any;
}

export interface WriteRowToDatabaseIfMissingProps {
  rows: FinanceSheetRow[];
}
export interface OnWriteRowToDatabaseIfMissingResult extends Result {
  requestedRowCount: number;
  writtenRowCount: number;
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
    ipcRenderer.on('readDatabaseRowsResult', (event, result) => callback(event, result)),

  writeRowToDatabase: async (props: WriteRowToDatabaseProps) => ipcRenderer.send('writeRowToDatabase', props),
  onWriteRowToDatabase: (callback: (event: any, values: OnWriteRowToDatabaseResult) => void) => 
    ipcRenderer.on('writeRowToDatabaseResult', (event, result) => callback(event, result)),

  deleteRowFromDatabase: async (props: DeleteRowFromDatabaseProps) => ipcRenderer.send('deleteRowFromDatabase', props),
  onDeleteRowFromDatabase: (callback: (event: any, values: OnDeleteRowFromDatabaseResult) => void) => 
    ipcRenderer.on('deleteRowFromDatabaseResult', (event, result) => callback(event, result)),

  writeRowToDatabaseIfMissing: async (props?: WriteRowToDatabaseIfMissingProps) => ipcRenderer.send('writeRowToDatabaseIfMissing', props),
  onWriteRowToDatabaseIfMissing: (callback: (event: any, values: OnWriteRowToDatabaseIfMissingResult) => void) => 
    ipcRenderer.on('writeRowToDatabaseIfMissingResult', (event, result) => callback(event, result)),

  getDbLocalPath: async (props?: GetDbLocalPathProps) => ipcRenderer.send('getDbLocalPath', props),
  onGetDbLocalPath: (callback: (event: any, values: OnGetDbLocalPathResult) => void) => 
    ipcRenderer.on('getDbLocalPathResult', (event, result) => callback(event, result)),

  updateRowInDatabase: async (props?: UpdateRowInDatabaseProps) => ipcRenderer.send('updateRowInDatabase', props),
  onUpdateRowInDatabase: (callback: (event: any, values: OnUpdateRowInDatabaseResult) => void) => 
    ipcRenderer.on('onUpdateRowInDatabase', (event, result) => callback(event, result)),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
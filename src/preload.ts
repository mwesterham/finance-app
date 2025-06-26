// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import {ipcRenderer, contextBridge} from "electron";
import { FinanceSheetRow, Rule } from "./db/WesterhamDatabase";

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

export interface ReadDatabaseRulesProps {
}
export interface OnReadDatabaseRulesResult extends Result {
  rules: Rule[];
}

export interface WriteDatabaseRulesProps {
  rules: Rule[];
}
export interface OnWriteDatabaseRulesResult extends Result {
  data: any;
}

export interface DeleteDatabaseRulesProps {
  ruleId: number;
}
export interface OnDeleteDatabaseRulesResult extends Result {
  deletedId: number;
  deleted: boolean;
}

export interface UpdateRuleInDatabaseProps {
  ruleId: string;
  rule: Rule;
}
export interface OnUpdateRuleInDatabaseResult extends Result {
  data: any;
}

export interface GetDistinctValuesOfColumnProps {
  table: 'finance_sheet' | 'rules'; 
  column: string;
}
export interface OnGetDistinctValuesOfColumnResult extends Result {
  distinctValues: string[];
}

export interface GetAllExistingDatabasesProps {
  
}
export interface OnGetAllExistingDatabasesResult extends Result {
  databases: string[];
}

export interface AttachDatabaseProps {
  databaseName: string;
}
export interface OnAttachDatabaseResult extends Result {
  success: boolean;
}

const electronAPI = {
  readDatabaseRows: async (props?: ReadDatabaseRowsProps) => ipcRenderer.send('readDatabaseRows', props),
  onReadDatabaseRows: (callback: (event: any, values: OnReadDatabaseRowsResult) => void) => 
    ipcRenderer.on('readDatabaseRowsResult', callback),
  detachOnReadDatabaseRows: () => ipcRenderer.removeAllListeners('readDatabaseRowsResult'),

  writeRowToDatabase: async (props: WriteRowToDatabaseProps) => ipcRenderer.send('writeRowToDatabase', props),
  onWriteRowToDatabase: (callback: (event: any, values: OnWriteRowToDatabaseResult) => void) => 
    ipcRenderer.on('writeRowToDatabaseResult', callback),
  detachOnWriteRowToDatabase: () => ipcRenderer.removeAllListeners('writeRowToDatabaseResult'),

  deleteRowFromDatabase: async (props: DeleteRowFromDatabaseProps) => ipcRenderer.send('deleteRowFromDatabase', props),
  onDeleteRowFromDatabase: (callback: (event: any, values: OnDeleteRowFromDatabaseResult) => void) => 
    ipcRenderer.on('deleteRowFromDatabaseResult', callback),
  detachOnDeleteRowFromDatabase: () => ipcRenderer.removeAllListeners('deleteRowFromDatabaseResult'),

  writeRowToDatabaseIfMissing: async (props?: WriteRowToDatabaseIfMissingProps) => ipcRenderer.send('writeRowToDatabaseIfMissing', props),
  onWriteRowToDatabaseIfMissing: (callback: (event: any, values: OnWriteRowToDatabaseIfMissingResult) => void) => 
    ipcRenderer.on('writeRowToDatabaseIfMissingResult', callback),
  detachOnWriteRowToDatabaseIfMissing: () => ipcRenderer.removeAllListeners('writeRowToDatabaseIfMissingResult'),

  readEmptyCategoryDatabaseRows: async (props?: ReadEmptyCategoryDatabaseRowsProps) => ipcRenderer.send('readEmptyCategoryDatabaseRows', props),
  onReadEmptyCategoryDatabaseRows: (callback: (event: any, values: OnReadEmptyCategoryDatabaseRowsResult) => void) => 
    ipcRenderer.on('readEmptyCategoryDatabaseRowsResult', callback),
  detachOnReadEmptyCategoryDatabaseRows: () => ipcRenderer.removeAllListeners('readEmptyCategoryDatabaseRowsResult'),

  getDbLocalPath: async (props?: GetDbLocalPathProps) => ipcRenderer.send('getDbLocalPath', props),
  onGetDbLocalPath: (callback: (event: any, values: OnGetDbLocalPathResult) => void) => 
    ipcRenderer.on('getDbLocalPathResult', callback),
  detachOnGetDbLocalPath: () => ipcRenderer.removeAllListeners('getDbLocalPathResult'),

  updateRowInDatabase: async (props?: UpdateRowInDatabaseProps) => ipcRenderer.send('updateRowInDatabase', props),
  onUpdateRowInDatabase: (callback: (event: any, values: OnUpdateRowInDatabaseResult) => void) => 
    ipcRenderer.on('onUpdateRowInDatabase', callback),
  detachOnUpdateRowInDatabase: () => ipcRenderer.removeAllListeners('onUpdateRowInDatabase'),

  readDatabaseRules: async (props?: ReadDatabaseRulesProps) => ipcRenderer.send('readDatabaseRules', props),
  onReadDatabaseRules: (callback: (event: any, values: OnReadDatabaseRulesResult) => void) => 
    ipcRenderer.on('readDatabaseRulesResult', callback),
  detachOnReadDatabaseRules: () => ipcRenderer.removeAllListeners('readDatabaseRulesResult'),

  writeDatabaseRules: async (props?: WriteDatabaseRulesProps) => ipcRenderer.send('writeDatabaseRules', props),
  onWriteDatabaseRules: (callback: (event: any, values: OnWriteDatabaseRulesResult) => void) => 
    ipcRenderer.on('writeDatabaseRulesResult', callback),
  detachOnWriteDatabaseRules: () => ipcRenderer.removeAllListeners('writeDatabaseRulesResult'),

  deleteDatabaseRules: async (props?: DeleteDatabaseRulesProps) => ipcRenderer.send('deleteDatabaseRules', props),
  onDeleteDatabaseRules: (callback: (event: any, values: OnDeleteDatabaseRulesResult) => void) => 
    ipcRenderer.on('deleteDatabaseRulesResult', callback),
  detachOnDeleteDatabaseRules: () => ipcRenderer.removeAllListeners('deleteDatabaseRulesResult'),

  updateRuleInDatabase: async (props?: UpdateRuleInDatabaseProps) => ipcRenderer.send('updateRuleInDatabase', props),
  onUpdateRuleInDatabase: (callback: (event: any, values: OnUpdateRuleInDatabaseResult) => void) => 
    ipcRenderer.on('onUpdateRuleInDatabase', callback),
  detachOnUpdateRuleInDatabase: () => ipcRenderer.removeAllListeners('onUpdateRuleInDatabase'),

  getDistinctValuesOfColumn: async (props?: GetDistinctValuesOfColumnProps) => ipcRenderer.send('getDistinctValuesOfColumn', props),
  onGetDistinctValuesOfColumn: (callback: (event: any, values: OnGetDistinctValuesOfColumnResult) => void) => 
    ipcRenderer.on('onGetDistinctValuesOfColumn', callback),
  detachOnGetDistinctValuesOfColumn: () => ipcRenderer.removeAllListeners('onGetDistinctValuesOfColumn'),

  getAllExistingDatabases: async (props?: GetAllExistingDatabasesProps) => ipcRenderer.send('getAllExistingDatabases', props),
  onGetAllExistingDatabases: (callback: (event: any, values: OnGetAllExistingDatabasesResult) => void) => 
    ipcRenderer.on('getAllExistingDatabases', callback),
  detachOnGetAllExistingDatabases: () => ipcRenderer.removeAllListeners('getAllExistingDatabases'),

  attachDatabase: async (props?: AttachDatabaseProps) => ipcRenderer.send('attachDatabase', props),
  onAttachDatabase: (callback: (event: any, values: OnAttachDatabaseResult) => void) => 
    ipcRenderer.on('attachDatabase', callback),
  detachOnAttachDatabase: () => ipcRenderer.removeAllListeners('attachDatabase'),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
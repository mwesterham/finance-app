// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import {ipcRenderer, contextBridge} from "electron";

// Declare types globally
declare global {
  interface Window { 
    electronAPI: typeof electronAPI
  }
}

interface Result {
  err?: any;
}

export interface ReadFileProps {
  filename: string;
  numlines?: number;
}

export interface OnReadFileResult extends Result {
  lines: string[];
}

export interface WriteToFileProps {
  csvLines: string[];
  filename: string;
}

export interface OnWriteToFileResult extends Result {
  data: any;
}

const electronAPI = {
  readFile: async (props: ReadFileProps) => ipcRenderer.send('readFile', props),
  onReadFile: (callback: (event: any, values: OnReadFileResult) => void) => 
    ipcRenderer.on('readFileResult', (event, result) => callback(event, result)),
  writeToFile: async (props: WriteToFileProps) => ipcRenderer.send('writeToFile', props),
  onWriteToFile: (callback: (event: any, values: OnWriteToFileResult) => void) => 
    ipcRenderer.on('writeToFileResult', (event, result) => callback(event, result)),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
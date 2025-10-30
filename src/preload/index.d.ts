import type { ElectronAPI } from '@electron-toolkit/preload'

import type {api} from './'

declare global {
  interface Window {
    electron: ElectronAPI
    api: typeof api 
  }
}

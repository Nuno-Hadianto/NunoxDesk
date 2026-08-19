/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  api: {
    appReady: () => void;
    login: (u: string, p: string) => Promise<any>;
    printPreview: (opts: any) => Promise<any>;
    exportPdf: (opts: any) => Promise<any>;
    // You can add more IPC methods here
    [key: string]: any;
  }
  Swal: any;
}

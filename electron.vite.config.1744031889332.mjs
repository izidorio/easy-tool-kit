// electron.vite.config.ts
import { resolve } from "node:path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import { viteStaticCopy } from "vite-plugin-static-copy";

// src/lib/electron-router-dom.ts
import { createElectronRouter } from "electron-router-dom";
var { Router, registerRoute, settings } = createElectronRouter({
  port: 4927,
  // a porta em que o seu servidor React está rodando ./electron.vite.config.ts "... renderer: { server: { port: 4927 }, ..."
  types: {
    /**
     * Os ids das janelas da sua aplicação, pense nesses ids como os basenames das rotas
     * essa nova forma permitirá que o intelisense do seu editor te ajude a saber quais ids estão disponíveis
     * tanto no main quanto no renderer process
     */
    ids: ["main"]
  }
});

// electron.vite.config.ts
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      viteStaticCopy({
        targets: [
          {
            src: "resources/*",
            dest: "resources"
          }
        ]
      })
    ]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    server: {
      port: settings.port
    },
    define: {
      "process.platform": JSON.stringify(process.platform)
    },
    css: {
      postcss: {
        plugins: [
          tailwindcss({
            config: "./src/renderer/tailwind.config.js"
          })
        ]
      }
    },
    resolve: {
      alias: {
        "@": resolve("src"),
        "@renderer": resolve("src/renderer/src")
      }
    },
    plugins: [react()]
  }
});
export {
  electron_vite_config_default as default
};

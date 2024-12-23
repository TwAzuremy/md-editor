import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()]
    },
    preload: {
        plugins: [externalizeDepsPlugin()]
    },
    renderer: {
        resolve: {
            alias: {
                "@renderer": resolve("src/renderer/src"),
                "@assets": resolve("src/renderer/src/assets"),
                "@components": resolve("src/renderer/src/components")
            }
        },
        plugins: [
            react(),
            svgr()
        ],
        css: {
            preprocessorOptions: {
                scss: {
                    api: "modern-compiler" // or "modern"
                }
            }
        },
        server: {
            watch: {
                usePolling: true   // 修复 HMR 热更新失效
            }
        }
    }
});

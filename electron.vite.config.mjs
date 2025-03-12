import {resolve} from "path";
import {defineConfig, externalizeDepsPlugin} from "electron-vite";
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
                "@components": resolve("src/renderer/src/components"),
                "@resources": resolve("resources"),
                "@utils": resolve("src/utils"),
                "@store": resolve("src/store")
            }
        },
        plugins: [
            react(),
            svgr({
                svgrOptions: {
                    icon: true
                }
            })
        ],
        css: {
            preprocessorOptions: {
                scss: {
                    api: "modern-compiler"
                }
            }
        },
        server: {
            watch: {
                // Fixed the issue that "HMR" hot update was invalid
                usePolling: true
            }
        },
        build: {
            rollupOptions: {
                treeshake: false
            }
        }
    }
});

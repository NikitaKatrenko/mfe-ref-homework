import path from "path";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import {defineConfig} from "vite";
import {dependencies} from './package.json';

const excludedDeps = ["react-router-dom"];

const generateSharedConfig = (dependencies: Record<string, string>) => {
    const sharedConfig: Record<string, { requiredVersion: string; singleton: boolean; import: boolean }> = {};

    Object.keys(dependencies).forEach((dependencyName) => {
        if (excludedDeps.includes(dependencyName)) return;
        sharedConfig[dependencyName] = {
            requiredVersion: dependencies[dependencyName],
            singleton: true,
            import: true,
        };
    });

    return sharedConfig;
};

export default defineConfig({
    plugins: [
        react(),
        federation({
            name: "auth",
            filename: "authRemoteEntry.js",
            exposes: {
                "./Auth": "./src/App.tsx",
            },
            shared: generateSharedConfig(dependencies),
        }),
    ],
    build: {
        modulePreload: false,
        target: "esnext",
        minify: false,
        cssCodeSplit: false,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})

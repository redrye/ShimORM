import {defineConfig} from 'vite';
import path from 'node:path';

export default defineConfig({
    root: path.resolve(__dirname),
    resolve: {
        alias: {
            "@": path.resolve(__dirname),
        },
    },
    server: {
        fs: {
            allow: [path.resolve(__dirname)],
        },
    },
    build: {
        outDir: path.resolve(__dirname, "dist"),
        emptyOutDir: true,
        lib: {
            entry: path.resolve(__dirname, "Database/index.ts"),
            name: "ShimORM",
            formats: ["es"],
            fileName: "index",
        },
        rollupOptions: {
            external: [
                "@traits-ts/core",
            ],
        },
    },
})
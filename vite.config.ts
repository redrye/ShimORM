import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
    root: path.resolve(__dirname, 'src/Tests'),
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        fs: {
            allow: [path.resolve(__dirname, 'src')],
        },
    },
});
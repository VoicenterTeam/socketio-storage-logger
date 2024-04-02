import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                exports: 'named'
            }
        },
        outDir: 'dist',
        sourcemap: true,
        commonjsOptions: {
            esmExternals: true
        },
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: [ 'es', 'cjs', 'umd', 'iife' ],
            name: 'StorageLogger',
            fileName: (format) => {
                return `storage-logger.${format}.js`
            },
        }
    },
    plugins: [
        dts({
            rollupTypes: true,
            copyDtsFiles: true
        })
    ]
})

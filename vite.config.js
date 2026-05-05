import restart from 'vite-plugin-restart'
import { resolve } from 'path'

export default {
    root: 'src/',                   // Sources files (typically where index.html is)
    publicDir: '../static/',        // Path from "root" to static assets

    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@shaders': resolve(__dirname, 'src/shaders'),
            '@world': resolve(__dirname, 'src/world'),
            '@utils': resolve(__dirname, 'src/utils'),
            '@templates': resolve(__dirname, 'src/templates'),
        }
    },

    server: {
        host: true,                 // Open to local network and display URL
        port: 3000,
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env)
    },

    build: {
        outDir: '../dist',          // Output in the dist/ folder
        emptyOutDir: true,          // Empty the folder first
        sourcemap: true,            // Add sourcemap
        rollupOptions: {
            output: {
                // Code splitting: tách Three.js ra chunk riêng
                manualChunks: {
                    'three-vendor': ['three'],
                }
            }
        }
    },

    // Hỗ trợ import file GLSL shader trực tiếp
    assetsInclude: ['**/*.glsl', '**/*.vert', '**/*.frag'],

    plugins: [
        restart({ restart: ['../static/**'] })  // Restart server on static file change
    ],
}
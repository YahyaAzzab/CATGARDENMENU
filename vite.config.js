import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
// Phone-first menu: the home screen stays small, and hashed files can be cached for a year.
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    build: {
        target: 'es2020',
        cssCodeSplit: true,
        modulePreload: { polyfill: false },
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/framer-motion'))
                        return 'motion';
                    if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/'))
                        return 'react';
                },
            },
        },
    },
});

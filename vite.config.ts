import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import GlobalsPolyfills from '@esbuild-plugins/node-globals-polyfill'

export default defineConfig({
	plugins: [ react(), tsconfigPaths() ],
	define: {
		'process.env': process.env
	},
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: 'globalThis'
			},
			plugins: [
				GlobalsPolyfills({
					process: true,
					buffer: true
				})
			]
		}
	},
	resolve: {
		alias: {
			stream: 'stream-browserify',
			https: 'agent-base'
		}
	}
});

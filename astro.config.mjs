import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	integrations: [
		react(),
		tailwind({
			applyBaseStyles: false,
		}),
	],
	vite: {
		ssr: {
			// d3 packages were migrated to ESM in 0.81 which nivo does not yet support
			noExternal: [/^d3.*$/, /^@nivo.*$/],
		},
	},
});
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	clearScreen: false,
	server: { port: 1420, strictPort: true },
	test: { include: ['src/**/*.test.ts'] }
});

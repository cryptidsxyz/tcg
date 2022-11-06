import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import unocss from 'unocss/vite';
import {
	presetIcons,
	presetTypography,
	presetUno,
	presetWebFonts,
	transformerAttributifyJsx,
	transformerCompileClass,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss';

const config: UserConfig = {
	plugins: [
		sveltekit(),
		unocss({
			presets: [
				presetIcons(),
				presetWebFonts({
					provider: 'google',
					fonts: {
						mono: 'JetBrains Mono'
					}
				}),
				presetTypography(),
				presetUno()
			],
			transformers: [
				transformerDirectives(),
				transformerVariantGroup(),
				transformerCompileClass(),
				transformerAttributifyJsx()
			]
		})
	],
	optimizeDeps: {
		include: ['@satellite-im/iridium'],
		exclude: ['@satellite-im/iridium'],
		esbuildOptions: {
			target: 'esnext'
		}
	}
};

export default config;

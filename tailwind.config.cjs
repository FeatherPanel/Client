/** @type {import('tailwindcss').Config}*/
const config = {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {},
	},
	plugins: [
		require('daisyui'),
		require('tailwind-scrollbar-hide')
	],
};

module.exports = config;

/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		screens: {
			sm: "480px",
			md: "768px",
			lg: "976px",
			xl: "1440px",
		},
		extend: {
			colors: {
				blueWhale: "#182A3A",
				wildBlueYonder: "#7A89C2",
				offWhite: "#FFF8F0",
				tealBlue: "#2E798A",
			},
		},
	},
	plugins: [],
};

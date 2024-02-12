/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		screens: {
			sm: "832px",
			md: "982px",
			lg: "1024px",
			xl: "1117px",
		},
		extend: {
			colors: {
				blueWhale: "#182A3A",
				wildBlueYonder: "#7A89C2",
				offWhite: "#FFF8F0",
				tealBlue: "#2E798A",
			},
			gridTemplateColumns: {
				"fluid": "repeat(auto-fit, minmax(20rem, 1fr))",
			},
		},
	},
	plugins: [],
};

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// import themes, { light } from "daisyui/src/theming/themes.js";


export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3000
  },
  // daisyui: {
  //   styled: true,
  //   themes: [
  //     {
  //       light: {
  //         ...themes.black,
  //         primary: "rgb(29, 240, 142)",
	// 				secondary: "rgb(24, 24, 24)",
  //       },
  //     },
  //   ],

  // },
})

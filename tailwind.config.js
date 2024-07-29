/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{dist,src}/**/*.{html,js}"],
  daisyui: {
    themes: [
      {
        gruvboxmaterial: {
          "base-content": "#D4BE98", //offwhite
          "neutral-content": "#D4BE98", //offwhite
          "primary": "#89B482", //seafoam
          "secondary": "#A9B665", //green
          "accent": "#D3869B", //purple
          "neutral": "#3C3836", //charcoal
          "base-100": "#3C3836", //charcoal
          "base-200": "#2a292e", //dark navy
          "info": "#7DAEA3", //blue
          "success": "#A9B665", //green
          "warning": "#D8A657", //yellow
          "error": "#EA6962", //red
        },
      },
    ],
  },
  theme: {
    fontFamily: {
      sans: ['Ubuntu', 'sans'],
      monospace: ['"Fira Code"', 'monospace']
    },
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui")
  ],
}


/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // 确保 Tailwind 可以扫描你的 HTML/JSX
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    // ...
  ],
};

/* eslint global-require: off, import/no-extraneous-dependencies: off */
// https://blog.saeloun.com/2023/02/24/integrate-tailwind-css-with-electron/
module.exports = {
  plugins: [require('tailwindcss'), require('autoprefixer')],
};
module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  plugins: [
    [require.resolve("@babel/plugin-proposal-class-properties")],
    [
      require.resolve("babel-plugin-module-resolver"),
      {
        root: ["./src"],
        alias: {
          "@": "./src",
        },
      },
    ],
  ],
};

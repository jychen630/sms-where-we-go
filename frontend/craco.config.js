const cracoPluginLogWebpackConfig = require("./craco-plugin-define-webpack-config");

module.exports = {
    babel: {
        loaderOptions: {
            ignore: ["./node_modules/mapbox-gl/dist/mapbox-gl.js"],
        },
    },
    plugins: [
        {
            plugin: cracoPluginLogWebpackConfig,
            options: {
                preText: "Load react mapbox secret from environment variables",
            },
        },
    ],
};

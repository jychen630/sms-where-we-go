const webpack = require("webpack");

module.exports = {
    overrideWebpackConfig: ({
        webpackConfig,
        cracoConfig,
        pluginOptions,
        context: { env, paths },
    }) => {
        if (pluginOptions.preText) {
            console.log(pluginOptions.preText);
        }

        if (!!!webpackConfig.plugins) webpackConfig.plugins = [];
        webpackConfig.plugins.push(
            new webpack.EnvironmentPlugin(["REACT_APP_MAPBOX_TOKEN"])
        );

        // Always return the config object.
        return webpackConfig;
    },
};

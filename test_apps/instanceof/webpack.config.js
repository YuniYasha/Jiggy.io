var Path = require('path');

var ROOT_DIR = Path.resolve('../../');
var DIST_DIR = Path.resolve(ROOT_DIR, 'dist/lib');

module.exports = {
    entry: "./App.ts",
    output: {
        filename: "./App.js",
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
        alias : {
            "@jiggy/assets"     : Path.resolve(DIST_DIR, 'assets/index.js'),
            "@jiggy/audio"      : Path.resolve(DIST_DIR, 'audio/index.js'),
            "@jiggy/core"       : Path.resolve(DIST_DIR, 'core/index.js'),
            "@jiggy/engines"    : Path.resolve(DIST_DIR, 'engines/index.js'),
            "@jiggy/entities"   : Path.resolve(DIST_DIR, 'entities/index.js'),
            "@jiggy/inputs"     : Path.resolve(DIST_DIR, 'inputs/index.js'),
            "@jiggy/interfaces" : Path.resolve(DIST_DIR, 'interfaces/index.js'),
            "@jiggy/utils"      : Path.resolve(DIST_DIR, 'utils/index.js'),
        }
        // alias : {
        //     "@jiggy/assets" : Path.resolve("../../src/assets/dist/assets/src/index.js"),
        //     "@jiggy/audio" : Path.resolve("../../src/audio/dist/audio/src/index.js"),
        //     "@jiggy/core" : Path.resolve("../../src/core/dist/core/src/index.js"),
        //     "@jiggy/engines" : Path.resolve("../../src/engines/dist/engines/src/index.js"),
        //     "@jiggy/entities" : Path.resolve("../../src/entities/dist/entities/src/index.js"),
        //     "@jiggy/inputs" : Path.resolve("../../src/inputs/dist/inputs/src/index.js"),
        //     "@jiggy/interfaces" : Path.resolve("../../src/interfaces/dist/index.js"),
        //     "@jiggy/utils" : Path.resolve("../../src/utils/dist/utils/src/index.js")
        // }
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { test: /\.tsx?$/, loader: "ts-loader" },
            { enforce: 'pre', test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
    }
};
var Path = require('path');
var ROOT_DIR = Path.resolve('../../');
var DIST_DIR = Path.resolve(ROOT_DIR, 'dist/lib');

module.exports = {
    entry: {
        App : "./App.ts"
        // resources : "./resources.ts"
    },
    output: {
        filename: "./dist/[name].js",
        chunkFilename: "./dist/[name].chunk.js"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { 
                test: /\.tsx?$/, 
                loader: "ts-loader",
                options : {
                    configFile : 'tsconfig.json'
                }
            },
            {
                test :  /\.(jpe?g|png|gif|svg|mp3)$/i,
                loader : "url-loader?name=./dist/res/[name].[ext]"
            },
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
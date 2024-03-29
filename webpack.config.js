const path = require('path');

module.exports = {
    mode: 'production', // Set the mode to 'production' or 'development'
    entry: './src/preload/preload.js', // Entry point of your application
    output: {
        path: path.resolve('./build'), // Output directory
        filename: 'preload.bundle.js' // Output filename
    },
    externals: [{
        '@jitsi/electron-sdk': 'require(\'@jitsi/electron-sdk\')',
        'electron-debug': 'require(\'electron-debug\')',
        'electron-reload': 'require(\'electron-reload\')'
    }],
    resolve: {
        fallback: {
            "crypto": require.resolve("crypto-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "path": require.resolve("path-browserify"),
            "fs": false, // or require.resolve("fs"),
            "stream": require.resolve("stream-browserify")

          },
        modules: [
            path.resolve('./node_modules')
        ]
    }
};

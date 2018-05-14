const path = require('path');

module.exports = {
    entry: './src/oscar2ical.js',
    node: {
        fs: 'empty'
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};

const exportPath = require("path")

module.exports = {
    context: __dirname,
    entry:"./src/main.ts",
    output : {
        filename : "main.js",
        path: exportPath.resolve(__dirname,"dist"),
        publicPath:"/dist/"
    },

    module:{
        rules: [
            {
              test: /\.ts$/,
              exclude : /node_moudles/,
              use: {
                loader:"ts-loader"
              }
            },
            {
                test: /\.wgsl$/,
                use: {
                    loader: "ts-shader-loader"
                }
            }
        ]
    },

    resolve :{
        extensions: [".ts"]
    }

}
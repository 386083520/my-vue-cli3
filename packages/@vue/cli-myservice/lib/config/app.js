const fs = require('fs')
const path = require('path')
module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        if (process.env.VUE_CLI_BUILD_TARGET && process.env.VUE_CLI_BUILD_TARGET !== 'app') {
            return
        }
        const isProd = process.env.NODE_ENV === 'production'
        if (isProd && !process.env.CYPRESS_ENV) {
            webpackConfig  // 从 webpack 4 开始，会根据你选择的 mode 来执行不同的优化， 不过所有的优化还是可以手动配置和重写。
                .optimization.splitChunks({ // 对于动态导入模块，默认使用 webpack v4+ 提供的全新的通用分块策略
                cacheGroups: {
                    vendors: {
                        name: `chunk-vendors`,
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        chunks: 'initial'
                    },
                    common: {
                        name: `chunk-common`,
                        minChunks: 2,
                        priority: -20,
                        chunks: 'initial',
                        reuseExistingChunk: true
                    }
                }
            })
        }

        const resolveClientEnv = require('../util/resolveClientEnv')
        if (options.indexPath !== 'index.html') {

        }

        const htmlOptions = {
            templateParameters: (compilation, assets, pluginOptions) => {
                let stats
                return Object.assign({
                    get webpack () {
                        return stats || (stats = compilation.getStats().toJson())
                    },
                    compilation: compilation,
                    webpackConfig: compilation.options,
                    htmlWebpackPlugin: {
                        files: assets,
                        options: pluginOptions
                    }
                }, resolveClientEnv(options, true /* raw */))
            }
        }

        if (isProd) {

        }
        const multiPageConfig = options.pages
        const HTMLPlugin = require('html-webpack-plugin') // 将为你生成一个 HTML5 文件， 在 body 中使用 script 标签引入你所有 webpack 生成的 bundle
        const PreloadPlugin = require('@vue/preload-webpack-plugin')
        const htmlPath = api.resolve('public/index.html')
        console.log('gsdhtmlPath', htmlPath)
        const defaultHtmlPath = path.resolve(__dirname, 'index-default.html')
        console.log('gsddefaultHtmlPath', defaultHtmlPath)
        const isLegacyBundle = process.env.VUE_CLI_MODERN_MODE && !process.env.VUE_CLI_MODERN_BUILD
        if (!multiPageConfig) {
            htmlOptions.template = fs.existsSync(htmlPath)
                ? htmlPath
                : defaultHtmlPath
            webpackConfig
                .plugin('html')
                .use(HTMLPlugin, [htmlOptions])
            if (!isLegacyBundle) {
                // 链接预取
                webpackConfig
                    .plugin('preload')
                    .use(PreloadPlugin, [{
                        rel: 'preload',
                        include: 'initial',
                        fileBlacklist: [/\.map$/, /hot-update\.js$/]
                    }])

                webpackConfig
                    .plugin('prefetch')
                    .use(PreloadPlugin, [{
                        rel: 'prefetch',
                        include: 'asyncChunks'
                    }])
            }
        }else {

        }
        if (options.crossorigin != null || options.integrity) {

        }
        const publicDir = api.resolve('public')
        if (!isLegacyBundle && fs.existsSync(publicDir)) {

        }
    })
}

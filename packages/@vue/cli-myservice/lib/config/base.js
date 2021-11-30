module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        const isLegacyBundle = process.env.VUE_CLI_MODERN_MODE && !process.env.VUE_CLI_MODERN_BUILD
        const resolveLocal = require('../util/resolveLocal')
        const getAssetPath = require('../util/getAssetPath')
        const inlineLimit = 4096

        const genAssetSubPath = dir => {
            return getAssetPath(
                options,
                `${dir}/[name]${options.filenameHashing ? '.[hash:8]' : ''}.[ext]`
            )
        }

        const genUrlLoaderOptions = dir => {
            return {
                limit: inlineLimit,
                // use explicit fallback to avoid regression in url-loader>=1.1.0
                fallback: {
                    loader: 'file-loader',
                    options: {
                        name: genAssetSubPath(dir)
                    }
                }
            }
        }

        webpackConfig
            .mode('development') // 告知 webpack 使用相应模式的内置优化。
            .context(api.service.context) // 基础目录，绝对路径，用于从配置中解析入口点(entry point)和 加载器(loader)。
            .entry('app')
            .add('./src/main.js') // entry: { app: [ './src/main.js' ] } // 开始应用程序打包过程的一个或多个起点
            .end()
            .output // 指示 webpack 如何去输出、以及在哪里输出
            .path(api.resolve(options.outputDir))
            .filename(isLegacyBundle ? '[name]-legacy.js' : '[name].js') // 此选项决定了每个输出 bundle 的名称。这些 bundle 将写入到 output.path 选项指定的目录下
            .publicPath(options.publicPath)
        // output: {
        //     path: 'I:\\vue\\lowcode\\demo\\formily-demo2\\dist',
        //     filename: '[name].js',
        //     publicPath: '/',
        //     globalObject: "(typeof self !== 'undefined' ? self : this)"
        //   }

        webpackConfig.resolve // 配置模块如何解析
            .extensions // 尝试按顺序解析这些后缀名,能够使用户在引入模块时不带扩展
            .merge(['.mjs', '.js', '.jsx', '.vue', '.json', '.wasm'])
            .end()
            .modules // 告诉 webpack 解析模块时应该搜索的目录
            .add('node_modules')
            .add(api.resolve('node_modules'))
            .add(resolveLocal('node_modules'))
            .end()
            .alias // 别名，来确保模块引入变得更简单
            .set('@', api.resolve('src'))
            .set(
                'vue$',
                options.runtimeCompiler
                    ? 'vue/dist/vue.esm.js'
                    : 'vue/dist/vue.runtime.esm.js'
            )

        webpackConfig.resolveLoader // 与上面的 resolve 对象的属性集合相同， 但仅用于解析 webpack 的 loader 包
            .modules
            .add('node_modules')
            .add(api.resolve('node_modules'))
            .add(resolveLocal('node_modules'))

        webpackConfig.module
            .noParse(/^(vue|vue-router|vuex|vuex-router-sync)$/) // 有些模块我们知道不会依赖第三方模块，所以在打包的时候不需要再进行解析，所以要配置忽略解析，提高我们的打包速度

        const vueLoaderCacheConfig = api.genCacheConfig('vue-loader', {
            'vue-loader': require('vue-loader/package.json').version,
            /* eslint-disable-next-line node/no-extraneous-require */
            '@vue/component-compiler-utils': require('@vue/component-compiler-utils/package.json').version,
            'vue-template-compiler': require('vue-template-compiler/package.json').version
        })

        webpackConfig.module
            .rule('vue')
            .test(/\.vue$/)
            .use('cache-loader') // 在一些性能开销较大的 loader 之前添加 cache-loader，以便将结果缓存到磁盘里
            .loader('cache-loader')
            .options(vueLoaderCacheConfig)
            .end()
            .use('vue-loader')
            .loader('vue-loader')
            .options(Object.assign({
                compilerOptions: {
                    preserveWhitespace: false
                }
            }, vueLoaderCacheConfig))

        webpackConfig
            .plugin('vue-loader') // 一个 webpack 的 loader，它允许你以一种名为单文件组件 (SFCs)的格式撰写 Vue 组件
            .use(require('vue-loader/lib/plugin'))

        webpackConfig.module
            .rule('images')
            .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
            .use('url-loader')
            .loader('url-loader')
            .options(genUrlLoaderOptions('img'))

        webpackConfig.module
            .rule('svg')
            .test(/\.(svg)(\?.*)?$/)
            .use('file-loader')
            .loader('file-loader')
            .options({
                name: genAssetSubPath('img')
            })

        webpackConfig.module
            .rule('media')
            .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
            .use('url-loader')
            .loader('url-loader')
            .options(genUrlLoaderOptions('media'))

        webpackConfig.module
            .rule('fonts')
            .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
            .use('url-loader')
            .loader('url-loader')
            .options(genUrlLoaderOptions('fonts'))

        webpackConfig.module
            .rule('pug')
            .test(/\.pug$/)
            .oneOf('pug-vue')
            .resourceQuery(/vue/)
            .use('pug-plain-loader')
            .loader('pug-plain-loader')
            .end()
            .end()
            .oneOf('pug-template')
            .use('raw')
            .loader('raw-loader')
            .end()
            .use('pug-plain')
            .loader('pug-plain-loader')
            .end()
            .end()

        webpackConfig.node
            .merge({
                // prevent webpack from injecting useless setImmediate polyfill because Vue
                // source contains it (although only uses it if it's native).
                setImmediate: false,
                // prevent webpack from injecting mocks to Node native modules
                // that does not make sense for the client
                dgram: 'empty',
                fs: 'empty',
                net: 'empty',
                tls: 'empty',
                child_process: 'empty'
            })

        const resolveClientEnv = require('../util/resolveClientEnv')
        webpackConfig
            .plugin('define')
            .use(require('webpack/lib/DefinePlugin'), [
                resolveClientEnv(options)
            ])

        webpackConfig
            .plugin('case-sensitive-paths') // 保障模块路径和磁盘的实际路径一致
            .use(require('case-sensitive-paths-webpack-plugin'))

        const { transformer, formatter } = require('../util/resolveLoaderError')
        webpackConfig
            .plugin('friendly-errors') // 对各种错误进行分类处理
            .use(require('@soda/friendly-errors-webpack-plugin'), [{
                additionalTransformers: [transformer],
                additionalFormatters: [formatter]
            }])
    })
}

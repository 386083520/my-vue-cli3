const semver = require('semver')
module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        console.log('gsdwebpackConfig1', webpackConfig)
        const hasPostCSSConfig = false
        const isProd = process.env.NODE_ENV === 'production'
        const shadowMode = !!process.env.VUE_CLI_CSS_SHADOW_MODE

        let sassLoaderVersion
        try {
            sassLoaderVersion = semver.major(require('sass-loader/package.json').version)
        } catch (e) {}

        const defaultSassLoaderOptions = {}
        try {
            defaultSassLoaderOptions.implementation = require('sass')
            // since sass-loader 8, fibers will be automatically detected and used
            if (sassLoaderVersion < 8) {
                defaultSassLoaderOptions.fiber = require('fibers')
            }
        } catch (e) {}

        const {
            modules = false,
            extract = isProd,
            sourceMap = false,
            loaderOptions = {}
        } = options.css || {}
        const shouldExtract = extract !== false && !shadowMode
        const needInlineMinification = isProd && !shouldExtract
        function createCSSRule (lang, test, loader, options) {
            console.log('gsdwebpackConfig.module', webpackConfig.module)
            const baseRule = webpackConfig.module.rule(lang).test(test)
            // rules for <style lang="module">
            const vueModulesRule = baseRule.oneOf('vue-modules').resourceQuery(/module/)
            applyLoaders(vueModulesRule, true)

            // rules for <style>
            const vueNormalRule = baseRule.oneOf('vue').resourceQuery(/\?vue/)
            applyLoaders(vueNormalRule, false)

            // rules for *.module.* files
            const extModulesRule = baseRule.oneOf('normal-modules').test(/\.module\.\w+$/)
            applyLoaders(extModulesRule, true)

            // rules for normal CSS imports
            const normalRule = baseRule.oneOf('normal')
            applyLoaders(normalRule, modules)

            function applyLoaders (rule, modules) {
                if (shouldExtract) {

                }else {
                    rule
                        .use('vue-style-loader')
                        .loader('vue-style-loader')
                        .options({
                            sourceMap,
                            shadowMode
                        })
                }
                const cssLoaderOptions = Object.assign({
                    sourceMap,
                    importLoaders: (
                        1 + // stylePostLoader injected by vue-loader
                        (hasPostCSSConfig ? 1 : 0) +
                        (needInlineMinification ? 1 : 0)
                    )
                }, loaderOptions.css)
                if (modules) {
                    const {
                        localIdentName = '[name]_[local]_[hash:base64:5]'
                    } = loaderOptions.css || {}
                    Object.assign(cssLoaderOptions, {
                        modules,
                        localIdentName
                    })
                    console.log('gsdcssLoaderOptions', cssLoaderOptions)
                }
                rule
                    .use('css-loader')
                    .loader('css-loader')
                    .options(cssLoaderOptions)
                if (needInlineMinification) {

                }
                if (hasPostCSSConfig) {

                }
                if (loader) {
                    rule
                        .use(loader)
                        .loader(loader)
                        .options(Object.assign({ sourceMap }, options))
                }
            }
        }
        createCSSRule('css', /\.css$/)
        createCSSRule('postcss', /\.p(ost)?css$/)
        createCSSRule('scss', /\.scss$/, 'sass-loader', Object.assign(
            {},
            defaultSassLoaderOptions,
            loaderOptions.scss || loaderOptions.sass
        ))
        if (sassLoaderVersion < 8) {

        }else {
            createCSSRule('sass', /\.sass$/, 'sass-loader', Object.assign(
                {},
                defaultSassLoaderOptions,
                loaderOptions.sass,
                {
                    sassOptions: Object.assign(
                        {},
                        loaderOptions.sass && loaderOptions.sass.sassOptions,
                        {
                            indentedSyntax: true
                        }
                    )
                }
            ))
        }
        createCSSRule('less', /\.less$/, 'less-loader', loaderOptions.less)
        createCSSRule('stylus', /\.styl(us)?$/, 'stylus-loader', Object.assign({
            preferPathResolver: 'webpack'
        }, loaderOptions.stylus))
        if (shouldExtract) {

        }
    })
}

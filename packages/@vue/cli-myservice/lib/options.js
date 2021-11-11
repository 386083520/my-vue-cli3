const { createSchema, validate } = require('@vue/cli-shared-utils')
const schema = createSchema(joi => joi.object({
    baseUrl: joi.string().allow(''),
    publicPath: joi.string().allow(''),
    outputDir: joi.string(),
    assetsDir: joi.string().allow(''),
    indexPath: joi.string(),
    filenameHashing: joi.boolean(),
    runtimeCompiler: joi.boolean(),
    transpileDependencies: joi.array(),
    productionSourceMap: joi.boolean(),
    parallel: joi.alternatives().try([
        joi.boolean(),
        joi.number().integer()
    ]),
    devServer: joi.object(),
    pages: joi.object().pattern(
        /\w+/,
        joi.alternatives().try([
            joi.string().required(),
            joi.array().items(joi.string().required()),

            joi.object().keys({
                entry: joi.alternatives().try([
                    joi.string().required(),
                    joi.array().items(joi.string().required())
                ]).required()
            }).unknown(true)
        ])
    ),
    crossorigin: joi.string().valid(['', 'anonymous', 'use-credentials']),
    integrity: joi.boolean(),

    // css
    css: joi.object({
        modules: joi.boolean(),
        extract: joi.alternatives().try(joi.boolean(), joi.object()),
        sourceMap: joi.boolean(),
        loaderOptions: joi.object({
            css: joi.object(),
            sass: joi.object(),
            scss: joi.object(),
            less: joi.object(),
            stylus: joi.object(),
            postcss: joi.object()
        })
    }),

    // webpack
    chainWebpack: joi.func(),
    configureWebpack: joi.alternatives().try(
        joi.object(),
        joi.func()
    ),

    // known runtime options for built-in plugins
    lintOnSave: joi.any().valid([true, false, 'error', 'warning', 'default']),
    pwa: joi.object(),

    // 3rd party plugin options
    pluginOptions: joi.object()
}))

exports.validate = (options, cb) => {
    validate(options, schema, cb)
}

const CracoSwcPlugin = require('craco-swc');

module.exports = {
    plugins: [
        {
            plugin: CracoSwcPlugin,
            options: {
                swcLoaderOptions: {
                    jsc: {
                        externalHelpers: true,
                        target: 'es2022',
                        parser: {
                            syntax: 'typescript',
                            tsx: true,
                            dynamicImport: true,
                            nullishCoalescing: true,
                            optionalChaining: true
                        },
                    },
                },
            },
        },
    ],
    webpack: {
        configure: {
            module: {
                rules: [
                    {
                        type: 'javascript/auto',
                        test: /\.mjs$/,
                        use: [],
                    },
                ],
            },
        },
    },
};
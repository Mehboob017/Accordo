const isProd = process.env.NODE_ENV === 'production';

export default {
    plugins: {
        ...(isProd
            ? {
                '@fullhuman/postcss-purgecss': {
                    content: [
                        './src/**/*.{js,jsx,ts,tsx,html,mdx}',
                        './public/**/*.html',
                    ],
                    defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
                    safelist: {
                        standard: [
                            'html',
                            'body',
                            /^active/,
                            /^show/,
                            /^fade/,
                            /^collapse/,
                            /^collapsing/,
                            /^modal/,
                            /^dropdown/,
                            /^nav/,
                            /^navbar/,
                            /^offcanvas/,
                            /^btn/,
                            /^badge/,
                            /^alert/,
                            /^card/,
                            /^row/,
                            /^col/,
                            /^container/,
                            /^slick/,
                            /^Toastify/,
                            /^ri-/,
                            /^lenis/,
                            /^dark/,
                            /^rtl/,
                            /^theme-color/,
                            /^tooltip/,
                            /^bs-tooltip/,
                            /^popover/,
                            /^bs-popover/,
                        ],
                        greedy: [
                            /^slick/,
                            /^Toastify/,
                            /^modal/,
                            /^show/,
                            /^collapse/,
                            /^fade/,
                            /^dark/,
                            /^rtl/,
                            /^theme-color/,
                            /^ri-/,
                            /^lenis/,
                            /^tooltip/,
                            /^bs-tooltip/,
                            /^popover/,
                            /^bs-popover/,
                        ],
                    },
                },
            }
            : {}),
    },
};
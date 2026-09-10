import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Bliss',
  description:
    'Bliss is a systems programming language exploring a new outlook on memory safety, programming paradigms, and the fundamentals of systems software.',

  lang: 'en-US',

  cleanUrls: true,

  markdown: {
    headers: true,
  },

  themeConfig: {
    nav: [
      { text: 'Language', link: '/docs/language' },
      { text: 'Compiler', link: '/docs/compiler' },
      { text: 'Blog', link: '/blog/' },
      { text: 'Downloads', link: '/#downloads' },
    ],

    sidebar: {
      '/docs/': [
        {
          label: 'Language',
          items: [
            { text: 'Overview', link: '/docs/language' },
            { text: 'Syntax', link: '/docs/syntax' },
            { text: 'Types', link: '/docs/types' },
            { text: 'Memory', link: '/docs/memory' },
          ],
        },
      ],
    },

    outline: [2, 3],
  },
})

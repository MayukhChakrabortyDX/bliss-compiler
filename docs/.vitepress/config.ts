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
      { text: 'Courses', link: '/courses/' },
      { text: 'Papers', link: '/papers/' },
      { text: 'Downloads', link: '/#downloads' },
    ],

    sidebar: {
      '/docs/': [
        {
          label: 'Language',
          items: [
            { text: 'Overview', link: '/docs/language' },
            { text: 'Syntax', link: '/docs/language/syntax' },
            { text: 'Types', link: '/docs/language/types' },
            { text: 'Expressions', link: '/docs/language/expressions' },
            { text: 'Statements and control flow', link: '/docs/language/statements' },
            { text: 'Modules and declarations', link: '/docs/language/modules' },
            { text: 'Language status', link: '/docs/language/status' },
          ],
        },
      ],
    },

    outline: [2, 3],
  },
})

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
      { text: 'Docs', link: '/docs/' },
      { text: 'Timeline', link: '/timeline/' },
      { text: 'Blog', link: '/blog/' },
      { text: 'Courses', link: '/courses/' },
      { text: 'Papers', link: '/papers/' },
    ],

    sidebar: {
      '/docs/': [
        {
          label: 'Language',
          items: [
            { text: 'Overview', link: '/docs/language' },
            { text: 'Language tour', link: '/docs/tour' },
            { text: 'Syntax', link: '/docs/language/syntax' },
            { text: 'Types', link: '/docs/language/types' },
            { text: 'Expressions', link: '/docs/language/expressions' },
            { text: 'Statements and control flow', link: '/docs/language/statements' },
            { text: 'Modules and declarations', link: '/docs/language/modules' },
            { text: 'Memory model', link: '/docs/memory' },
            { text: 'Memory walkthrough', link: '/docs/memory-walkthrough' },
            { text: 'Language status', link: '/docs/language/status' },
          ],
        },
        {
          label: 'Compiler',
          items: [
            { text: 'Overview', link: '/docs/compiler' },
            { text: 'Architecture', link: '/docs/architecture' },
            { text: 'Parsing', link: '/docs/parsing' },
            { text: 'Pipeline walkthrough', link: '/docs/pipeline-walkthrough' },
          ],
        },
      ],
    },

    outline: [2, 3],
  },
})

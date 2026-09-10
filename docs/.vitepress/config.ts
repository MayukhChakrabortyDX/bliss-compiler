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
      { text: 'Language', link: '/language/' },
      { text: 'Compiler', link: '/compiler/' },
      { text: 'Blog', link: '/blog/' },
      { text: 'Downloads', link: '/#downloads' },
    ],

    sidebar: {
      '/language/': [
        {
          label: 'Language',
          items: [
            { text: 'Overview', link: '/language/' },
            { text: 'Syntax', link: '/language/syntax' },
            { text: 'Types', link: '/language/types' },
            { text: 'Memory', link: '/language/memory' },
          ],
        },
      ],
      '/compiler/': [
        {
          label: 'Compiler',
          items: [
            { text: 'Overview', link: '/compiler/' },
            { text: 'Architecture', link: '/compiler/architecture' },
            { text: 'Parsing', link: '/compiler/parsing' },
          ],
        },
      ],
    },

    outline: [2, 3],
  },
})

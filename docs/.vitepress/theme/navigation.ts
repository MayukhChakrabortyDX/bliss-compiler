export type NavItem = {
  text: string
  link?: string
  items?: NavItem[]
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const docsNavigation: NavGroup[] = [
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
  {
    label: 'Compiler',
    items: [
      { text: 'Overview', link: '/docs/compiler' },
      { text: 'Architecture', link: '/docs/architecture' },
      { text: 'Parsing', link: '/docs/parsing' },
      { text: 'Pipeline walkthrough', link: '/docs/pipeline-walkthrough' },
    ],
  },
]

export function flattenNavigation(groups: NavGroup[]) {
  return groups.flatMap((group) => flattenItems(group.items))
}

function flattenItems(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => [
    ...(item.link ? [item] : []),
    ...(item.items ? flattenItems(item.items) : []),
  ])
}

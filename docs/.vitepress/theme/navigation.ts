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
      { text: 'Syntax', link: '/docs/syntax' },
      { text: 'Types', link: '/docs/types' },
      { text: 'Memory', link: '/docs/memory' },
      { text: 'Language tour', link: '/docs/tour' },
      { text: 'Memory walkthrough', link: '/docs/memory-walkthrough' },
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

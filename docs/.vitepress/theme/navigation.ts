export type NavItem = {
  text: string
  link?: string
  items?: NavItem[]
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const docsNavigation: Record<string, NavGroup[]> = {
  language: [
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
  compiler: [
    {
      label: 'Compiler',
      items: [
        { text: 'Overview', link: '/compiler/' },
        { text: 'Architecture', link: '/compiler/architecture' },
        { text: 'Parsing', link: '/compiler/parsing' },
      ],
    },
  ],
}

export function flattenNavigation(groups: NavGroup[]) {
  return groups.flatMap((group) => flattenItems(group.items))
}

function flattenItems(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => [
    ...(item.link ? [item] : []),
    ...(item.items ? flattenItems(item.items) : []),
  ])
}

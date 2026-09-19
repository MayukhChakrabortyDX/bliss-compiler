export type NavItem = {
  text: string
  link?: string
  description?: string
  topic?: string
  variant?: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'zinc'
  items?: NavItem[]
}

export type NavGroup = {
  id: string
  label: string
  title: string
  description: string
  link: string
  badge: string
  topic: string
  variant: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'zinc'
  highlights: string[]
  items: NavItem[]
}

export const docsNavigation: NavGroup[] = [
  {
    id: 'language',
    label: 'Language',
    title: 'Language Semantics',
    description: 'Core syntax, algebraic types, lexical ownership verification, and control flow semantics.',
    link: '/docs/language',
    badge: 'Section 01',
    topic: 'section-language',
    variant: 'violet',
    highlights: ['Syntax & Lexing', 'Algebraic Types', 'Lexical Ownership', 'Control Flow'],
    items: [
      { text: 'Overview', link: '/docs/language', topic: 'overview-lang', variant: 'violet', description: 'Core concepts, design goals, and memory safety model of the Bliss language.' },
      { text: 'Language tour', link: '/docs/tour', topic: 'tour', variant: 'blue', description: 'An extended walkthrough of Bliss language constructs and expressions.' },
      { text: 'Syntax', link: '/docs/language/syntax', topic: 'syntax', variant: 'blue', description: 'Lexical structure, identifiers, keywords, comments, and code formatting rules.' },
      { text: 'Types', link: '/docs/language/types', topic: 'types', variant: 'emerald', description: 'Primitive types, structs, enums, type inference, and memory layouts.' },
      { text: 'Expressions', link: '/docs/language/expressions', topic: 'expressions', variant: 'amber', description: 'Values, mathematical & logical operators, blocks, and pattern evaluation.' },
      { text: 'Statements and control flow', link: '/docs/language/statements', topic: 'statements', variant: 'rose', description: 'Conditional branching, loops, pattern matching, and control jumps.' },
      { text: 'Modules and declarations', link: '/docs/language/modules', topic: 'modules', variant: 'indigo', description: 'Code organization, namespaces, imports, visibility rules, and packages.' },
      { text: 'Memory model', link: '/docs/memory', topic: 'memory', variant: 'rose', description: 'Design directions for ownership, borrowing, and memory safety in Bliss.' },
      { text: 'Memory walkthrough', link: '/docs/memory-walkthrough', topic: 'memory-walkthrough', variant: 'amber', description: 'Exploratory guide to storage, lifetime, and resource management.' },
      { text: 'Language status', link: '/docs/language/status', topic: 'status', variant: 'zinc', description: 'Current feature completeness, stable guarantees, and active language proposals.' },
    ],
  },
  {
    id: 'compiler',
    label: 'Compiler',
    title: 'Compiler Architecture',
    description: 'Subsystem architecture, progressive error recovery parsing, and AST transformations.',
    link: '/docs/compiler',
    badge: 'Section 02',
    topic: 'section-compiler',
    variant: 'blue',
    highlights: ['Pipeline Stages', 'Bounded Recovery', 'AST Generation', 'LLVM Lowering'],
    items: [
      { text: 'Overview', link: '/docs/compiler', topic: 'overview-compiler', variant: 'violet', description: 'The Bliss compiler toolchain, design philosophy, and performance goals.' },
      { text: 'Architecture', link: '/docs/architecture', topic: 'architecture', variant: 'emerald', description: 'Layered subsystem breakdown from lexical scanning to code generation.' },
      { text: 'Parsing', link: '/docs/parsing', topic: 'parsing', variant: 'blue', description: 'Lexical analysis, precedence parsing, error recovery, and AST node creation.' },
      { text: 'Pipeline walkthrough', link: '/docs/pipeline-walkthrough', topic: 'pipeline-walkthrough', variant: 'amber', description: 'Step-by-step traversal of source code transformation through compiler stages.' },
    ],
  },
  {
    id: 'specifications',
    label: 'Specifications',
    title: 'AST Specifications',
    description: 'Authoritative AST node contracts, parse tree definitions, and stabilized grammar productions.',
    link: '/docs/specifications/',
    badge: 'Section 03',
    topic: 'section-specifications',
    variant: 'amber',
    highlights: ['AST Stabilization', 'ParseNode Contract', 'DAOP & Control Flow', 'Grammar Productions'],
    items: [
      { text: 'Overview', link: '/docs/specifications/', topic: 'overview-spec', variant: 'amber', description: 'AST stabilization design, ParseTree model, and base ParseNode contract.' },
      { text: 'Allocator', link: '/docs/specifications/allocator', topic: 'grammar', variant: 'violet', description: 'Allocator AST node contract, formal EBNF production, and analyzer boundaries.' },
      { text: 'Loops', link: '/docs/specifications/loops', topic: 'loops', variant: 'blue', description: 'Loop AST node definition, labeled jump targets, and formal EBNF grammar.' },
      { text: 'Conditionals', link: '/docs/specifications/conditionals', topic: 'conditionals', variant: 'emerald', description: 'Branch AST nodes (IfBranch, ElifBranch, ElseBranch) and parsing recovery boundaries.' },
      { text: 'DAOP', link: '/docs/specifications/daop', topic: 'daop', variant: 'amber', description: 'Data layouts, action contracts, data bindings, and type aliases.' },
      { text: 'Program root', link: '/docs/specifications/program', topic: 'program', variant: 'rose', description: 'Program root AST node, compilation unit grammar, and declaration collections.' },
      { text: 'Operator expressions', link: '/docs/specifications/expressions', topic: 'expressions', variant: 'indigo', description: 'BinaryOperator and UnaryOperator AST nodes and precedence climbing specifications.' },
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

export interface SubNavLink {
  label: string
  href: string
  external?: boolean
}

export interface SegmentConfig {
  title: string
  links: SubNavLink[]
}

export const segmentConfigs: Record<string, SegmentConfig> = {
  docs: {
    title: 'Docs',
    links: [
      { label: 'Overview', href: '/docs/' },
      { label: 'Language', href: '/docs/language' },
      { label: 'Compiler', href: '/docs/compiler' },
      { label: 'Specifications', href: '/docs/specifications/' },
    ],
  },
  timeline: {
    title: 'Timeline',
    links: [
      { label: 'Overview', href: '/timeline/' },
      { label: 'In Flight', href: '/timeline/#in-flight' },
      { label: 'Up Next', href: '/timeline/#up-next' },
      { label: 'Shipped', href: '/timeline/#shipped' },
    ],
  },
  blog: {
    title: 'Blog',
    links: [
      { label: 'All Articles', href: '/blog/' },
      { label: 'Subscribe', href: '#subscribe' },
    ],
  },
  courses: {
    title: 'Courses',
    links: [
      { label: 'All Courses', href: '/courses/' },
      { label: 'YouTube ↗', href: 'https://www.youtube.com/', external: true },
    ],
  },
  papers: {
    title: 'Papers',
    links: [
      { label: 'All Papers', href: '/papers/' },
      { label: 'Archive', href: '/papers/#archive' },
    ],
  },
}

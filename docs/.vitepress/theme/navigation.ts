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
    title: 'Formal Specifications',
    description: 'Authoritative grammar productions, memory safety invariants, and static type system guarantees.',
    link: '/docs/specifications/',
    badge: 'Section 03',
    topic: 'section-specifications',
    variant: 'amber',
    highlights: ['Formal Grammar', 'Pointer Capabilities', 'Point of Failure (POF)', 'Type Invariants'],
    items: [
      { text: 'Overview', link: '/docs/specifications/', topic: 'overview-spec', variant: 'amber', description: 'Formal specification scope, conformance standards, and stability tiers.' },
      { text: 'Grammar', link: '/docs/specifications/grammar', topic: 'grammar', variant: 'violet', description: 'Lexical structure, operator precedence, and EBNF production rules.' },
      { text: 'Memory model', link: '/docs/specifications/memory', topic: 'spec-memory', variant: 'rose', description: 'Pointer capability tiers, stack confinement, and Point of Failure observability.' },
      { text: 'Type system', link: '/docs/specifications/types', topic: 'spec-types', variant: 'emerald', description: 'Scalar primitives, algebraic sum types, structural records, and exhaustiveness.' },
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

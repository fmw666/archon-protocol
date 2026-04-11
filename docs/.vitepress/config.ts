import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Archon Protocol',
  description: 'AI 工程治理协议 — 把 AI 编程助手变成自主的工程负责人',
  lang: 'zh-CN',
  // 使用自定义域名（aaep.site）时 base 为 '/'
  // 仅用 GitHub Pages 默认域名时改为 '/archon-protocol/'
  base: '/',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '指南', link: '/guide/', activeMatch: '/guide/' },
      { text: '架构', link: '/architecture/', activeMatch: '/architecture/' },
      { text: '协议源码', link: '/reference/', activeMatch: '/reference/' },
      { text: '下载', link: '/download/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '什么是 Archon', link: '/guide/' },
            { text: '设计哲学', link: '/guide/philosophy' },
            { text: '快速开始', link: '/guide/quick-start' },
          ],
        },
      ],
      '/architecture/': [
        {
          text: '架构设计',
          items: [
            { text: '系统总览', link: '/architecture/' },
            { text: '认知循环', link: '/architecture/cognitive-cycle' },
            { text: '交付生命周期', link: '/architecture/delivery-lifecycle' },
            { text: '约束金字塔', link: '/architecture/constraint-pyramid' },
            { text: 'Drift 漂移机制', link: '/architecture/drift' },
            { text: 'Sub-agent 委托', link: '/architecture/sub-agent' },
            { text: '知识进化系统', link: '/architecture/knowledge-evolution' },
          ],
        },
      ],
      '/reference/': [
        {
          text: '协议源码',
          items: [
            { text: '总览', link: '/reference/' },
            { text: 'Soul 认知内核', link: '/reference/soul' },
            { text: 'Commands 命令', link: '/reference/commands' },
            { text: 'Agents 子代理', link: '/reference/agents' },
            { text: 'Rules 规则', link: '/reference/rules' },
            { text: 'Templates 模板', link: '/reference/templates' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/fmw666/archon-protocol' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Archon Protocol',
    },
    outline: { label: '目录', level: [2, 3] },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '最后更新' },
    search: { provider: 'local' },
  },
})

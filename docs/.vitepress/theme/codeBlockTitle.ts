import type MarkdownIt from 'markdown-it'

export function codeBlockTitlePlugin(md: MarkdownIt) {
  const originalFence = md.renderer.rules.fence

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const rawInfo = token.info.trim()

    const titleMatch = rawInfo.match(/\s*\[(.+?)\]\s*$/)
    const render = originalFence || self.renderToken.bind(self)

    if (titleMatch) {
      const title = titleMatch[1]
      token.info = rawInfo.replace(/\s*\[.+?\]\s*$/, '').trim()

      const rendered = render(tokens, idx, options, env, self)
      const escapedTitle = md.utils.escapeHtml(title)
      return `<div class="code-with-title"><div class="code-block-title">${escapedTitle}</div>${rendered}</div>`
    }

    return render(tokens, idx, options, env, self)
  }
}

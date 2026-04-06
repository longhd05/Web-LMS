import { Fragment, type ReactNode } from 'react'

function renderInline(text: string): ReactNode[] {
  const tokens = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g)

  return tokens.map((token, index) => {
    if (token.startsWith('***') && token.endsWith('***')) {
      const content = token.slice(3, -3)
      return (
        <strong key={index}>
          <em>{content}</em>
        </strong>
      )
    }

    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={index}>{token.slice(2, -2)}</strong>
    }

    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={index}>{token.slice(1, -1)}</em>
    }

    return <Fragment key={index}>{token}</Fragment>
  })
}

export function renderSimpleMarkdown(multilineText?: string): ReactNode {
  if (!multilineText) return null

  const lines = multilineText.split('\n')
  return lines.map((line, index) => (
    <Fragment key={`${line}-${index}`}>
      {renderInline(line)}
      {index < lines.length - 1 && <br />}
    </Fragment>
  ))
}

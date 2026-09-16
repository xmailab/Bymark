export const WORK_TITLE_MAX_LENGTH = 40
export const FILENAME_TITLE_MAX_LENGTH = 32

function sliceCharacters(value: string, maximum: number) {
  return Array.from(value).slice(0, maximum).join('')
}

export function normalizeWorkTitle(value: unknown) {
  return typeof value === 'string' ? sliceCharacters(value, WORK_TITLE_MAX_LENGTH) : ''
}

export function textTitleFor(text: string) {
  const firstLine = text.split('\n').find((line) => line.trim())?.trim() ?? ''
  if (!firstLine) return '未命名草稿'
  return sliceCharacters(firstLine, 22)
}

export function resolvedTitleFor(state: { title: string; text: string }) {
  return state.title.trim() || textTitleFor(state.text)
}

export function filenameTitleFor(title: string) {
  const normalized = title
    .normalize('NFKC')
    .replace(/[\p{Cc}<>:"/\\|?*]+/gu, ' ')
    .replace(/[“”‘’]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.\s-]+|[.\s-]+$/g, '')
  return sliceCharacters(normalized, FILENAME_TITLE_MAX_LENGTH).replace(/[.\s-]+$/g, '')
}

export function filenameBaseFor(title: string, date: string) {
  const segment = filenameTitleFor(title.trim())
  return `bymark-${segment ? `${segment}-` : ''}${date}`
}

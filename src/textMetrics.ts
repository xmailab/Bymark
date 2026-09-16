export function countChineseCharacters(text: string) {
  return (text.match(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/gu) ?? []).length
}

/** Counts visible writing characters, including punctuation, spaces, and line breaks. */
export function countCharacters(text: string) {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)).length
  }
  return Array.from(text).length
}

import parser from './parser';
import compiler from './compiler';

export function wordsToNumbers (text, options = {}) {
  const regions = parser(text, options);
  if (!regions.length) return text;
  const compiled = compiler({ text, regions });
  return compiled;
}

export default wordsToNumbers;

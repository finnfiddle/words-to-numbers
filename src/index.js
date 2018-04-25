import parser from './parser';

export function wordsToNumbers (text, options) {
  const parsed = parser(text, options);
  console.log(parsed);
}

export default wordsToNumbers;

/* Node module for converting words to numerals.
  Convert words to numbers. Optionally fuzzy match the words to numbers.
  `npm install words-to-numbers`
  If the whole string passed is a number then it will return a Number type otherwise it will return the original string with all instances of numbers replaced.
*/

import lexer from './lexer';
import Parser from './parser';
import compiler from './compiler';
import transformer from './transformer';

const parser = new Parser([]);

export default function wordsToNumbers (text, options) {
  const lexed = lexer.tokenize(text);
  parser.input = lexed.tokens;
  const parsed = parser.parse();
  // console.log(lexed);
  // console.log(JSON.stringify(parsed.children.number[0].children.tu[0], null, 2));
  const { children: { number: data } } = parsed;
  if (!data) return text;
  const compiled = compiler(data, text);
  return transformer(compiled, text);
}

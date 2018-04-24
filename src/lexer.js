import { createToken, Lexer } from 'chevrotain';

import {
  UNIT_KEYS,
  TEN_KEYS,
  MAGNITUDE_KEYS,
  PUNCTUATION_REGEX,
  WHITESPACE_REGEX,
  JOINER_REGEX,
  WORD_REGEX,
  POINT_WORDS,
} from './constants';

const Whitespace = createToken({
  name: 'Whitespace',
  pattern: WHITESPACE_REGEX,
  group: Lexer.SKIPPED,
  line_breaks: true
});
const Punctuation = createToken({
  name: 'Punctuation',
  pattern: PUNCTUATION_REGEX,
  group: Lexer.SKIPPED,
});
const Joiner = createToken({
  name: 'Joiner',
  pattern: JOINER_REGEX,
  group: Lexer.SKIPPED,
});
const Word = createToken({
  name: 'Word',
  pattern: WORD_REGEX,
  group: Lexer.SKIPPED,
});
const Unit = createToken({ name: 'Unit', pattern: new RegExp(`(${UNIT_KEYS.join('|')})`, 'i') });
const Ten = createToken({ name: 'Ten', pattern: new RegExp(`(${TEN_KEYS.join('|')})`, 'i') });
const Magnitude = createToken({ name: 'Magnitude', pattern: new RegExp(`(${MAGNITUDE_KEYS.join('|')})`, 'i') });
const Decimal = createToken({ name: 'Decimal', pattern: new RegExp(`(${POINT_WORDS.join('|')})`, 'i') });

export const tokens = {
  Joiner,
  Whitespace,
  Punctuation,
  Magnitude,
  Ten,
  Unit,
  Word,
  Decimal,
};

export const tokensArray = [
  Whitespace,
  Decimal,
  Punctuation,
  Ten,
  Magnitude,
  Unit,
  Joiner,
  Word,
];

export default new Lexer(tokensArray, {
  // Adds tokenClassName property to the output for easier debugging in the playground
  // Do not use this flag in a productive env, as it will hurt performance.
  debug: true
});

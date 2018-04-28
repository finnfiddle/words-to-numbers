import clj_fuzzy from 'clj-fuzzy';
import itsSet from 'its-set';

import { ALL_WORDS } from './constants';

export default (word, haystack) => {
  return (haystack || ALL_WORDS)
    .map(numberWord => ({
      word: numberWord,
      score: clj_fuzzy.metrics.jaro(numberWord, word)
    }))
    .reduce((acc, stat) => !itsSet(acc.score) || stat.score > acc.score ? stat : acc, {})
    .word;
};

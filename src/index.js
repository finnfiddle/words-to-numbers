// inpired by this answer on stackoverflow: http://stackoverflow.com/a/12014376 by http://stackoverflow.com/users/631193/javaandcsharp and thanks to @Greg Hewgill for the original, written in Python.

import itsSet from 'its-set';
import clj_fuzzy from 'clj-fuzzy';

const PRIMARY_COUNT = {
  zero: 0,
  a: 1,
  one: 1,
  first: 1,
  two: 2,
  second: 2,
  three: 3,
  third: 3,
  four: 4,
  fourth: 4,
  five: 5,
  fifth: 5,
  six: 6,
  sixth: 6,
  seven: 7,
  seventh: 7,
  eight: 8,
  eighth: 8,
  nine: 9,
  ninth: 9,
  ten: 10,
  tenth: 10,
  eleven: 11,
  eleventh: 11,
  twelve: 12,
  twelfth: 12,
  thirteen: 13,
  thirteenth: 13,
  fourteen: 14,
  fourteenth: 14,
  fifteen: 15,
  fifteenth: 15,
  sixteen: 16,
  sixteenth: 16,
  seventeen: 17,
  seventeenth: 17,
  eighteen: 18,
  eighteenth: 18,
  nineteen: 19,
  nineteenth: 19,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  '11': 11,
  '12': 12,
  '13': 13,
  '14': 14,
  '15': 15,
  '16': 16,
  '17': 17,
  '18': 18,
  '19': 19
};

const SECONDARY_COUNT = {
  twenty: 20,
  twentieth: 20,
  thirty: 30,
  thirtieth: 30,
  forty: 40,
  fortieth: 40,
  fifty: 50,
  fiftieth: 50,
  sixty: 60,
  sixtieth: 60,
  seventy: 70,
  seventieth: 70,
  eighty: 80,
  eightieth: 80,
  ninety: 90,
  ninetieth: 90,
  '20': 20,
  '30': 30,
  '40': 40,
  '50': 50,
  '60': 60,
  '70': 70,
  '80': 80,
  '90': 90
};

const COUNT = Object.assign({}, PRIMARY_COUNT, SECONDARY_COUNT);

const MAGNITUDE = {
  hundred: 100,
  hundredth: 100,
  thousand: 1000,
  million: 1000000,
  billion: 1000000000,
  trillion: 1000000000000,
  quadrillion: 1000000000000000,
  quintillion: 1000000000000000000,
  sextillion: 1000000000000000000000,
  septillion: 1000000000000000000000000,
  octillion: 1000000000000000000000000000,
  nonillion: 1000000000000000000000000000000,
  decillion: 1000000000000000000000000000000000,
};

const NUMBER_WORDS = Object.keys(COUNT)
  .concat(Object.keys(MAGNITUDE))
  .concat(['and', 'point', 'dot']);

const clean = word => word.replace(',', '');

const extractNumberRegions = words => {
  const numWords = words.length;

  const numberWords = words
    .map(word => NUMBER_WORDS.includes(clean(word)));

  let pointReached = false;

  const reduced = numberWords
    .reduce((acc, isNumberWord, i) => {
      if (isNumberWord) {
        if (words[i] === 'point' || words[i] === 'dot') pointReached = true;

        if (!itsSet(acc.start)) {
          acc.start = i;
        }
        else if (
          Object.keys(PRIMARY_COUNT).includes(words[i - 1]) &&
          Object.keys(PRIMARY_COUNT).includes(words[i]) &&
          !pointReached
        ) {
          acc.regions.push({start: acc.start, end: i - 1});
          if (i === numWords - 1) {
            acc.regions.push({start: i, end: i});
          }
          else {
            acc.start = i;
          }
        }
      }
      else if (itsSet(acc.start)) {
        acc.regions.push({start: acc.start, end: i - 1});
        acc.start = null;
      }
      return acc;
    }, {regions: [], start: null});
  return reduced.start === 0 && !reduced.regions.length ? 'whole' : reduced.regions;
};

const convertWordsToDecimal = words =>
  words.map(word => COUNT[word])
    .join('');

const convertWordsToNonDecimal = words => {
  const reduced = words.reduce((acc, word) => {
    const cleanWord = clean(word);
    if (cleanWord === 'and') return acc;
    if (itsSet(acc.count)) {
      if (itsSet(COUNT[cleanWord])) {
        acc.extra += COUNT[acc.count];
        acc.count = cleanWord;
      }
      else {
        acc.pairs.push({count: acc.count, magnitude: cleanWord});
        acc.count = null;
      }
    }
    else {
      acc.count = cleanWord;
    }
    return acc;
  }, {pairs: [], count: null, extra: 0});

  return reduced.pairs.reduce((acc, pair) =>
    acc + COUNT[pair.count] * MAGNITUDE[pair.magnitude]
  , COUNT[reduced.count] || 0) + reduced.extra;
};

const convertWordsToNumber = words => {
  let pointIndex = words.indexOf('point');
  if (pointIndex === -1) pointIndex = words.indexOf('dot');

  if (pointIndex > -1) {
    const numberWords = words.slice(0, pointIndex);
    const decimalWords = words.slice(pointIndex + 1);
    return parseFloat(`${convertWordsToNonDecimal(numberWords)}.${convertWordsToDecimal(decimalWords)}`);
  }
  return convertWordsToNonDecimal(words);
};

const fuzzyMatch = word => {
  return NUMBER_WORDS
    .map(numberWord => ({
      word: numberWord,
      score: clj_fuzzy.metrics.jaro(numberWord, word)
    }))
    .reduce((acc, stat) => !itsSet(acc.score) || stat.score > acc.score ? stat : acc, {})
    .word;
};

export function wordsToNumbers (text, options) {
  const opts = Object.assign({fuzzy: false}, options);
  let words = text.toString().split(/[\s-]+/);
  if (opts.fuzzy) words = words.map(word => fuzzyMatch(word));
  const regions = extractNumberRegions(words);

  if (regions === 'whole') return convertWordsToNumber(words);
  if (!regions.length) return null;

  let removedWordsCount = 0;
  return regions.map(region =>
    convertWordsToNumber(words.slice(region.start, region.end + 1))
  )
  .reduce((acc, replacedRegion, i) => {
    const removeCount = regions[i].end - regions[i].start + 1;
    const result = acc.slice(0);
    result.splice(regions[i].start - removedWordsCount, removeCount, replacedRegion);
    removedWordsCount += removeCount - 1;
    return result;
  }, words)
  .join(' ');
}

export default wordsToNumbers;

/* Node module for converting words to numerals.
  Convert words to numbers. Optionally fuzzy match the words to numbers.
  `npm install words-to-numbers`
  If the whole string passed is a number then it will return a Number type otherwise it will return the original string with all instances of numbers replaced.
*/

import itsSet from 'its-set';
import clj_fuzzy from 'clj-fuzzy';
import ohm from 'ohm-js';

const UNIT = {
  zero: 0,
  first: 1,
  one: 1,
  second: 2,
  two: 2,
  third: 3,
  thirteenth: 13,
  thirteen: 13,
  three: 3,
  fourth: 4,
  fourteenth: 14,
  fourteen: 14,
  four: 4,
  fifteenth: 15,
  fifteen: 15,
  fifth: 5,
  five: 5,
  sixth: 6,
  sixteenth: 16,
  sixteen: 16,
  six: 6,
  seventeenth: 17,
  seventeen: 17,
  seventh: 7,
  seven: 7,
  eighteenth: 18,
  eighteen: 18,
  eighth: 8,
  eight: 8,
  nineteenth: 19,
  nineteen: 19,
  ninth: 9,
  nine: 9,
  tenth: 10,
  ten: 10,
  eleventh: 11,
  eleven: 11,
  twelfth: 12,
  twelve: 12,
  a: 1,
};

const TEN = {
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
};

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

const UNIT_KEYS = Object.keys(UNIT);
const TEN_KEYS = Object.keys(TEN);
const MAGNITUDE_KEYS = Object.keys(MAGNITUDE);

// all words found in number phrases
const NUMBER_WORDS = ['and', 'point', 'dot']
  .concat(UNIT_KEYS)
  .concat(TEN_KEYS)
  .concat(MAGNITUDE_KEYS);

const PUNCTUATION = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;

const grammar = ohm.grammar(`
  WordsToNumbers {
    Number = Section* ("point" | "dot")? unit*
    Section = TenAndMagnitude | UnitAndMagnitude | TenUnitAndMagnitude | Unit | Ten | TenAndUnit | Magnitude
    Ten = ten ~unit ~magnitude
    TenAndUnit = ten unit ~magnitude
    TenAndMagnitude = ten ~unit magnitude
    UnitAndMagnitude = ~ten unit magnitude
    TenUnitAndMagnitude = ten unit magnitude
    Unit = ~ten unit ~magnitude
    Magnitude = ~ten ~unit magnitude
    ten = ${TEN_KEYS.map(key => `"${key}" | `).join('').slice(0, -2)}
    unit = ${UNIT_KEYS.map(key => `"${key}" | `).join('').slice(0, -2)}
    magnitude = ${MAGNITUDE_KEYS.map(key => `"${key}" | `).join('').slice(0, -2)}
  }
`);

const semantics = grammar
  .createSemantics()
  .addOperation('eval', {
    Number: (sections, point, decimal) => {
      const ints = sections.children.reduce((sum, child) => sum + child.eval(), 0);
      if (point.children.length) {
        const decimals = decimal.children
          .reduce((acc, d) => `${acc}${d.eval()}`, '')
          .replace(/\s/g, '');
        return parseFloat(`${ints}.${decimals}`);
      }
      return ints;
    },
    Ten: ten => ten.eval(),
    Unit: (unit) => unit.eval(),
    TenAndUnit: (ten, unit) => ten.eval() + unit.eval(),
    TenAndMagnitude: (ten, magnitude) => ten.eval() * magnitude.eval(),
    UnitAndMagnitude: (unit, magnitude) => unit.eval() * magnitude.eval(),
    TenUnitAndMagnitude: (ten, unit, magnitude) =>
      (ten.eval() + unit.eval()) * magnitude.eval(),
    Magnitude: magnitude => magnitude.eval(),
    unit: (value) => UNIT[value.primitiveValue],
    ten: (value) => TEN[value.primitiveValue],
    magnitude: (value) => MAGNITUDE[value.primitiveValue],
  });

// try coerce a word into a NUMBER_WORD using fuzzy matching
const fuzzyMatch = word => {
  return NUMBER_WORDS
    .map(numberWord => ({
      word: numberWord,
      score: clj_fuzzy.metrics.jaro(numberWord, word)
    }))
    .reduce((acc, stat) => !itsSet(acc.score) || stat.score > acc.score ? stat : acc, {})
    .word;
};

const isUnit = word => UNIT_KEYS.indexOf(word) !== -1;
const isTen = word => TEN_KEYS.indexOf(word) !== -1;
const isMag = word => MAGNITUDE_KEYS.indexOf(word) !== -1;

const findRegions = (text, fuzzy) => {
  const words = text
    .split(/[ -]/g)
    .map(word => fuzzy ? fuzzyMatch(word) : word)
    .reduce((acc, word, i) => {
      const start = acc.length ? acc[i - 1].end + 1 : 0;
      return acc.concat({
        text: word,
        start,
        end: start + word.length,
      });
    }, [])
    .map(word =>
      Object.assign({}, word, {
        isNumberWord: NUMBER_WORDS.indexOf(
          word.text.replace(PUNCTUATION, '').toLowerCase()
        ) !== -1,
      })
    );

  return words
    .reduce((regions, word, index) => {
      if (!word.isNumberWord) return regions;
      if (!regions.length) return [word];
      if (word.text === 'point' || word.text === 'dot') {
        const newRegions = regions.slice();
        newRegions[regions.length - 1].pointReached = true;
        newRegions[regions.length - 1].end = word.end;
        newRegions[regions.length - 1].text += ` ${word.text}`;
        return newRegions;
      }
      const prevRegion = regions[regions.length - 1];
      const prevWord = words[index - 1] || '';
      if (
        prevRegion.end === word.start - 1 &&
        !(isUnit(word.text) && isUnit(prevWord.text) || prevRegion.pointReached) &&
        !(isTen(word.text) && isTen(prevWord.text)) &&
        !(isMag(word.text) && isMag(prevWord.text)) &&
        !(isTen(word.text) && isUnit(prevWord.text)) ||
        (prevRegion.pointReached && isUnit(word.text)) ||
        word === 'and' ||
        prevWord === 'and'
      ) {
        const newRegions = regions.slice();
        newRegions[regions.length - 1].end = word.end;
        newRegions[regions.length - 1].text += ` ${word.text}`;
        return newRegions;
      }
      return regions.concat(word);
    }, []);
};

const evaluateNumberRegion = text => {
  const textIsOnlyHelperWord = ['a', 'and'].reduce((acc, word) => acc || text === word, false);
  if (textIsOnlyHelperWord) return text;
  var m = grammar.match(text.replace(PUNCTUATION, ' ').replace(/\band\b/g, ''));
  if (m.succeeded()) {
    return semantics(m).eval();
  }
  else {
    console.log(m.message);
    return text;
  }
};

function splice (str, index, count, add) {
  let i = index;
  if (i < 0) {
    i = str.length + i;
    if (i < 0) {
      i = 0;
    }
  }
  return str.slice(0, i) + (add || '') + str.slice(i + count);
}

// replace all number words in a string with actual numerals.
// If string contains multiple separate numbers then replace each one individually.
// If option `fuzzy` = true then try coerce words into numbers before conversion to numbers.
export function wordsToNumbers (text, options) {
  const opts = Object.assign({fuzzy: false}, options);
  const regions = findRegions(text, opts.fuzzy);
  if (!regions.length) return text;
  if (regions.length === 1 && regions[0].start === 0 && regions[0].end === regions[0].text.length) {
    return evaluateNumberRegion(regions[0].text);
  }
  return regions
    .map(region => evaluateNumberRegion(region.text))
    .reverse()
    .reduce((acc, number, index) => {
      const region = regions[regions.length - index - 1];
      return splice(
        acc,
        region.start,
        region.end - region.start,
        `${number}`
      );
    }, text);
}

export default wordsToNumbers;

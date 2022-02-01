"use strict";

// constants
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

const NUMBER = { ...UNIT, ...TEN, ...MAGNITUDE };

const UNIT_KEYS = Object.keys(UNIT);
const TEN_KEYS = Object.keys(TEN);
const MAGNITUDE_KEYS = Object.keys(MAGNITUDE);

const NUMBER_WORDS = [ ...UNIT_KEYS, ...TEN_KEYS, ...MAGNITUDE_KEYS];

const JOINERS = ['and'];
const DECIMALS = ['point', 'dot'];

const PUNCTUATION = [
  '.',
  ',',
  '\\',
  '#',
  '!',
  '$',
  '%',
  '^',
  '&',
  '/',
  '*',
  ';',
  ':',
  '{',
  '}',
  '=',
  '-',
  '_',
  '`',
  '~',
  '(',
  ')',
  ' ',
];

const TOKEN_TYPE = {
  UNIT: 0,
  TEN: 1,
  MAGNITUDE: 2,
  DECIMAL: 3,
  HUNDRED: 4,
};


// parser
const canAddTokenToEndOfSubRegion = (subRegion, currentToken) => {
  const { tokens } = subRegion;
  const prevToken = tokens[0];
  if (!prevToken) return true;
  if (prevToken.type === TOKEN_TYPE.MAGNITUDE && currentToken.type === TOKEN_TYPE.UNIT) return true;
  if (prevToken.type === TOKEN_TYPE.MAGNITUDE && currentToken.type === TOKEN_TYPE.TEN) return true;
  if (prevToken.type === TOKEN_TYPE.TEN && currentToken.type === TOKEN_TYPE.UNIT) return true;
  if (prevToken.type === TOKEN_TYPE.TEN && currentToken.type === TOKEN_TYPE.UNIT) return true;
  if (prevToken.type === TOKEN_TYPE.MAGNITUDE && currentToken.type === TOKEN_TYPE.MAGNITUDE) return true;
  if (prevToken.type === TOKEN_TYPE.TEN && currentToken.type === TOKEN_TYPE.TEN) return false;
};

const getSubRegionType = (subRegion, currentToken) => {
  if (!subRegion) return { type: currentToken.type };

  const prevToken = subRegion.tokens[0];
  const isHundred = (
    (prevToken.type === TOKEN_TYPE.TEN && currentToken.type === TOKEN_TYPE.UNIT) ||
    (prevToken.type === TOKEN_TYPE.TEN && currentToken.type === TOKEN_TYPE.TEN) ||
    (
      prevToken.type === TOKEN_TYPE.UNIT && currentToken.type === TOKEN_TYPE.TEN &&
      NUMBER[prevToken.lowerCaseValue] > 9
    ) ||
    (prevToken.type === TOKEN_TYPE.UNIT && currentToken.type === TOKEN_TYPE.UNIT) ||
    (prevToken.type === TOKEN_TYPE.TEN && currentToken.type === TOKEN_TYPE.UNIT && subRegion.type === TOKEN_TYPE.MAGNITUDE)
  );
  if (subRegion.type === TOKEN_TYPE.MAGNITUDE) return { type: TOKEN_TYPE.MAGNITUDE, isHundred };
  if (isHundred) return { type: TOKEN_TYPE.HUNDRED, isHundred };
  return { type: currentToken.type, isHundred };
};

const checkIfTokenFitsSubRegion = (subRegion, token) => {
  const { type, isHundred } = getSubRegionType(subRegion, token);
  if (!subRegion) return { action: 2, type, isHundred };
  if (canAddTokenToEndOfSubRegion(subRegion, token)) return { action: 1, type, isHundred };
  return { action: 2, type, isHundred };
};

const getSubRegions = (region) => {
  const subRegions = [];
  let currentSubRegion;
  let i = region.tokens.length - 1;
  while (i >= 0) {
    const token = region.tokens[i];
    const { action, type, isHundred } = checkIfTokenFitsSubRegion(currentSubRegion, token);
    token.type = isHundred ? TOKEN_TYPE.HUNDRED : token.type;
    switch (action) {
      case 1: {
        currentSubRegion.type = type;
        currentSubRegion.tokens.unshift(token);
        break;
      }
      case 2: {
        currentSubRegion = {tokens: [token], type};
        subRegions.unshift(currentSubRegion);
        break;
      }
    }
    i--;
  }
  return subRegions;
};

const canAddTokenToEndOfRegion = (region, currentToken) => {
  const { tokens } = region;
  const prevToken = tokens[tokens.length - 1];
  if (prevToken.type === TOKEN_TYPE.UNIT && currentToken.type === TOKEN_TYPE.UNIT && !region.hasDecimal) return false;
  if (prevToken.type === TOKEN_TYPE.UNIT && currentToken.type === TOKEN_TYPE.TEN) return false;
  if (prevToken.type === TOKEN_TYPE.TEN && currentToken.type === TOKEN_TYPE.TEN) return false;
  return true;
};

const checkIfTokenFitsRegion = (region, token) => {
  const isDecimal = DECIMALS.includes(token.lowerCaseValue);
  if ((!region || !region.tokens.length) && isDecimal) return 2;

  const isPunctuation = PUNCTUATION.includes(token.lowerCaseValue);
  if (isPunctuation) return 0;
  const isJoiner = JOINERS.includes(token.lowerCaseValue);
  if (isJoiner) return 0;
  if (isDecimal && !region.hasDecimal) return 1;
  const isNumberWord = NUMBER_WORDS.includes(token.lowerCaseValue);
  if (isNumberWord) {
    if (!region) return 2;
    if (canAddTokenToEndOfRegion(region, token)) return 1;
    return 2;
  }
  return 3;
};

const matchRegions = (tokens) => {
  const regions = [];

  if (tokens.length === 1 && tokens[0].lowerCaseValue === "a") return [];

  let i = 0;
  let currentRegion;
  const tokensCount = tokens.length;
  while (i < tokensCount) {
    const token = tokens[i];
    const tokenFits = checkIfTokenFitsRegion(currentRegion, token);
    switch (tokenFits) {
      case 0: {
        break;
      }
      case 1: {
        if (currentRegion) {
          currentRegion.end = token.end;
          currentRegion.tokens.push(token);
          if (token.type === TOKEN_TYPE.DECIMAL) {
            currentRegion.hasDecimal = true;
          }
        }
        break;
      }
      case 2: {
        currentRegion = {
          start: token.start,
          end: token.end,
          tokens: [token],
        };
        regions.push(currentRegion);
        if (token.type === TOKEN_TYPE.DECIMAL) {
          currentRegion.hasDecimal = true;
        }
        break;
      }
      case 3:
      default: {
        currentRegion = null;
        break;
      }
    }
    i++;
  }

  return regions.map(region => ({ ...region, subRegions: getSubRegions(region) }));
};

const getTokenType = (chunk) => {
  if (UNIT_KEYS.includes(chunk)) return TOKEN_TYPE.UNIT;
  if (TEN_KEYS.includes(chunk)) return TOKEN_TYPE.TEN;
  if (MAGNITUDE_KEYS.includes(chunk)) return TOKEN_TYPE.MAGNITUDE;
  if (DECIMALS.includes(chunk)) return TOKEN_TYPE.DECIMAL;
};

const parser = (text) => {
  const tokens = text.split(/(\w+|\s)/i)
    .reduce((acc, chunk) => {
      const start = acc.length ? acc[acc.length - 1].end + 1 : 0;
      const end = start + chunk.length;
      return end !== start ?
        acc.concat({
          start,
          end: end - 1,
          value: chunk,
          lowerCaseValue: chunk.toLowerCase(),
          type: getTokenType(chunk.toLowerCase()),
        }) :
        acc;
    }, []);
  return matchRegions(tokens);
};





// compiler
const splice = (str, index, count, add) => {
  const i = index < 0 ? str.length + index : str.length + index < 0 ? 0 : index

  return str.slice(0, i) + (add || '') + str.slice(i + count);
};


const getNumber = region => {
  let sum = 0;
  let decimalReached = false;
  let decimalUnits = [];
  region.subRegions.forEach((subRegion) => {
    const { tokens, type } = subRegion;
    let subRegionSum = 0;
    if (type === TOKEN_TYPE.DECIMAL) {
      decimalReached = true;
      return;
    }
    if (decimalReached) {
      decimalUnits.push(subRegion);
      return;
    }
    switch (type) {
      case TOKEN_TYPE.MAGNITUDE:
      case TOKEN_TYPE.HUNDRED: {
        subRegionSum = 1;
        const tokensCount = tokens.length;
        tokens.reduce((acc, token, i) => {
          if (token.type === TOKEN_TYPE.HUNDRED) {
            let tokensToAdd = tokensCount - 1 ? tokens.slice(i + 1) : [];
            tokensToAdd = tokensToAdd.filter((tokenToAdd, j) => j === 0 || tokensToAdd[j - 1].type > tokenToAdd.type);

            const tokensToAddSum = tokensToAdd.reduce((acc2, tokenToAdd) => acc2 + NUMBER[tokenToAdd.lowerCaseValue], 0);
            
            return acc.concat({...tokens[i + 1],numberValue: tokensToAddSum + (NUMBER[token.lowerCaseValue] * 100)});
          }
          if (i > 0 && tokens[i - 1].type === TOKEN_TYPE.HUNDRED) return acc;
          if (i > 1 && tokens[i - 1].type === TOKEN_TYPE.TEN && tokens[i - 2].type === TOKEN_TYPE.HUNDRED) return acc;

          return acc.concat({ token, numberValue: NUMBER[token.lowerCaseValue] });
        }, []).forEach(({ numberValue }) => {
          subRegionSum *= numberValue;
        });
        break;
      }
      case TOKEN_TYPE.UNIT:
      case TOKEN_TYPE.TEN: {
        tokens.forEach(token => {
          subRegionSum += NUMBER[token.lowerCaseValue];
        });
        break;
      }
    }
    sum += subRegionSum;
  });

  decimalUnits.forEach(({ tokens }) => {
    tokens.forEach(({ lowerCaseValue }, index) => {
      sum += NUMBER[lowerCaseValue] / Math.pow(10, index+1);
    });
  });

  return sum;
};

const replaceRegionsInText = (regions, text) => {
  let replaced = text;
  let offset = 0;
  regions.forEach(region => {
    const length = region.end - region.start + 1;
    const replaceWith = `${getNumber(region)}`;
    replaced = splice(replaced, region.start + offset, length, replaceWith);
    offset -= length - replaceWith.length;
  });
  return replaced;
};

const compiler = ({ regions, text }) => {
  if (regions[0].end - regions[0].start === text.length - 1) return getNumber(regions[0]);
  return replaceRegionsInText(regions, text);
};

// exported wordsToNumber funtion
export function wordsToNumbers (text) {
  const regions = parser(text);
  if (!regions || !regions.length) return text;
  return compiler({ text, regions });
}
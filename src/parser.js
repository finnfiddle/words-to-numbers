import {
  PUNCTUATION,
  NUMBER_WORDS,
  UNIT_KEYS,
  TEN_KEYS,
  MAGNITUDE_KEYS,
  TOKEN_TYPE,
  JOINERS,
  DECIMALS,
  BLACKLIST_SINGULAR_WORDS,
} from './constants';
import fuzzyMatch from './fuzzy';

const SKIP = 0;
const ADD = 1;
const START_NEW_REGION = 2;
const NOPE = 3;

const canAddTokenToEndOfSubRegion = (subRegion, token) => {
  const { tokens } = subRegion;
  const { type } = token;
  const prevToken = tokens[0];
  if (!prevToken) return true;
  if (prevToken.type === TOKEN_TYPE.MAGNITUDE && type === TOKEN_TYPE.UNIT) return true;
  if (prevToken.type === TOKEN_TYPE.MAGNITUDE && type === TOKEN_TYPE.TEN) return true;
  if (prevToken.type === TOKEN_TYPE.TEN && type === TOKEN_TYPE.UNIT) return true;
  if (prevToken.type === TOKEN_TYPE.MAGNITUDE && type === TOKEN_TYPE.MAGNITUDE) return true;
  return false;
};

const getSubRegionType = (subRegion, currentToken) => {
  if (!subRegion) {
    return currentToken.type;
  }
  if (subRegion.type === TOKEN_TYPE.MAGNITUDE) return TOKEN_TYPE.MAGNITUDE;
  return currentToken.type;
};

const checkIfTokenFitsSubRegion = (subRegion, token) => {
  if (!subRegion) return { action: START_NEW_REGION, type: getSubRegionType(subRegion, token) };
  if (canAddTokenToEndOfSubRegion(subRegion, token)) {
    return { action: ADD, type: getSubRegionType(subRegion, token) };
  }
  return { action: START_NEW_REGION, type: getSubRegionType(subRegion, token) };
};

const getSubRegions = region => {
  const subRegions = [];
  let currentSubRegion;
  const tokensCount = region.tokens.length;
  let i = tokensCount - 1;
  while (i >= 0) {
    const token = region.tokens[i];
    const { action, type } = checkIfTokenFitsSubRegion(currentSubRegion, token);
    switch (action) {
      case ADD: {
        currentSubRegion.type = type;
        currentSubRegion.tokens.unshift(token);
        break;
      }
      case START_NEW_REGION: {
        currentSubRegion = {
          tokens: [token],
          type,
        };
        subRegions.unshift(currentSubRegion);
        break;
      }
      // no default
    }
    i--;
  }
  return subRegions;
};

const canAddTokenToEndOfRegion = (region, token) => {
  const { tokens } = region;
  const { type } = token;
  const prevToken = tokens[tokens.length - 1];
  if (prevToken.type === TOKEN_TYPE.UNIT && type === TOKEN_TYPE.UNIT) return false;
  if (prevToken.type === TOKEN_TYPE.UNIT && type === TOKEN_TYPE.TEN) return false;
  if (prevToken.type === TOKEN_TYPE.TEN && type === TOKEN_TYPE.TEN) return false;
  return true;
};

const checkIfTokenFitsRegion = (region, token) => {
  const isPunctuation = PUNCTUATION.includes(token.lowerCaseValue);
  if (isPunctuation) return SKIP;
  const isJoiner = JOINERS.includes(token.lowerCaseValue);
  if (isJoiner) return SKIP;
  const isDecimal = DECIMALS.includes(token.lowerCaseValue);
  if (isDecimal) return ADD;
  const isNumberWord = NUMBER_WORDS.includes(token.lowerCaseValue);
  if (isNumberWord) {
    if (!region) return START_NEW_REGION;
    if (canAddTokenToEndOfRegion(region, token)) {
      return ADD;
    }
    return START_NEW_REGION;
  }
  return NOPE;
};

const regionIsValid = region => {
  if (region.tokens.length === 1) {
    if (['a'].includes(region.tokens[0].lowerCaseValue)) return false;
  }
  return true;
};

const getDecimalTokenIndex = (tokens) => tokens.reduce((acc, token, i) =>
  DECIMALS.includes(token.lowerCaseValue) ? i : acc
, -1);

const getDecimalSubRegion = (tokens) => ({
  start: tokens[0].start,
  end: tokens[tokens.length - 1].end,
  tokens: tokens.reduce((acc, token) =>
    NUMBER_WORDS.concat(DECIMALS).includes(token.lowerCaseValue) ?
      acc.concat(token) :
      acc
  , []),
  type: TOKEN_TYPE.DECIMAL,
});

const checkBlacklist = tokens =>
  tokens.length === 1 &&
  BLACKLIST_SINGULAR_WORDS.includes(tokens[0].lowerCaseValue);

const matchRegions = (tokens) => {
  const regions = [];

  if (checkBlacklist(tokens)) return regions;

  let i = 0;
  let currentRegion;
  const tokensCount = tokens.length;
  const decimalIndex = getDecimalTokenIndex(tokens);
  while (i < (decimalIndex === -1 ? tokensCount : decimalIndex)) {
    const token = tokens[i];
    const tokenFits = checkIfTokenFitsRegion(currentRegion, token);
    switch (tokenFits) {
      case SKIP: {
        break;
      }
      case ADD: {
        currentRegion.end = token.end;
        currentRegion.tokens.push(token);
        break;
      }
      case START_NEW_REGION: {
        currentRegion = {
          start: token.start,
          end: token.end,
          tokens: [token],
        };
        regions.push(currentRegion);
        break;
      }
      case NOPE:
      default: {
        currentRegion = null;
        break;
      }
    }
    i++;
  }
  return regions.reduce((acc, region) => {
    const decimalRegion = decimalIndex !== -1 ?
      getDecimalSubRegion(tokens.slice(decimalIndex)) :
      { tokens: [] };
      let subRegions = getSubRegions(region);
      if (decimalRegion.tokens.length) {
        subRegions = subRegions.concat(decimalRegion);
      }
      const regionWithDecimal = {
        ...region,
        subRegions,
      };
    regionWithDecimal.tokens = [ ...regionWithDecimal.tokens, ...decimalRegion.tokens ];
    if (regionWithDecimal.tokens.length) {
      regionWithDecimal.end = regionWithDecimal.tokens[regionWithDecimal.tokens.length - 1].end;
    }
    return regionIsValid(decimalRegion) ? acc.concat(regionWithDecimal) : acc;
  }, []);
};

const getTokenType = (chunk) => {
  if (UNIT_KEYS.includes(chunk.toLowerCase())) return TOKEN_TYPE.UNIT;
  if (TEN_KEYS.includes(chunk.toLowerCase())) return TOKEN_TYPE.TEN;
  if (MAGNITUDE_KEYS.includes(chunk.toLowerCase())) return TOKEN_TYPE.MAGNITUDE;
  if (DECIMALS.includes(chunk.toLowerCase())) return TOKEN_TYPE.DECIMAL;
};

export default (text, options) => {
  const tokens = text
    .split(/(\w+|\s|[[:punct:]])/i)
    .reduce((acc, chunk) => {
      const unfuzzyChunk = chunk.length && options.fuzzy && !PUNCTUATION.includes(chunk) ?
        fuzzyMatch(chunk) :
        chunk;
      const start = acc.length ? acc[acc.length - 1].end + 1 : 0;
      const end = start + chunk.length;
      return end !== start ?
      acc.concat({
        start,
        end: end - 1,
        value: unfuzzyChunk,
        lowerCaseValue: unfuzzyChunk.toLowerCase(),
        type: getTokenType(unfuzzyChunk, options),
      }) :
      acc;
    }, []);
  const regions = matchRegions(tokens, options);
  return regions;
};

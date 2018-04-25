import { PUNCTUATION, NUMBER_WORDS } from './constants';

const SKIP = 0;
const ADD = 1;
const START_NEW_REGION = 2;
const NOPE = 3;

const canAddTokenToEndOfRegion = (region, token) => true;

const checkIfTokenFits = (region, token) => {
  const isPunctuation = PUNCTUATION.concat(' ').includes(token.value);
  if (isPunctuation) return SKIP;
  const isNumberWord = NUMBER_WORDS.includes(token.value);
  if (isNumberWord) {
    if (!region) return START_NEW_REGION;
    if (canAddTokenToEndOfRegion(region, token)) {
      return ADD;
    }
    return START_NEW_REGION;
  }
  return NOPE;
};

const matchRegions = tokens => {
  const regions = [];
  let i = 0;
  let currentRegion;
  const tokensCount = tokens.length;
  while (i < tokensCount) {
    const token = tokens[i];
    const tokenFits = checkIfTokenFits(currentRegion, token);
    switch (tokenFits) {
      case SKIP: {
        if (currentRegion) currentRegion.end = token.end;
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
  return regions;
};

export default (text) => {
  const tokens = text
    .split(/([\s]|[.,\/#!$%\^&\*;:{}=\-_`~()])/)
    .reduce((acc, chunk) => {
      const start = acc.length ? acc[acc.length - 1].end + 1 : 0;
      return acc.concat({ start, end: start + chunk.length, value: chunk });
    }, []);
  const regions = matchRegions(tokens);
  return regions;
};

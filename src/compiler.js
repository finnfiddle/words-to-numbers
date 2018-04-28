import { splice } from './util';
import { TOKEN_TYPE, NUMBER, DECIMALS } from './constants';

const getNumber = region => {
  let sum = 0;
  region.subRegions.forEach(({ tokens, type }) => {
    let subRegionSum = 0;
    switch (type) {
      case TOKEN_TYPE.MAGNITUDE: {
        subRegionSum = 1;
        tokens.forEach(token => {
          subRegionSum *= NUMBER[token.lowerCaseValue];
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
      case TOKEN_TYPE.DECIMAL: {
        tokens.forEach((token, i) => {
          if (!DECIMALS.includes(token.lowerCaseValue)) {
            subRegionSum += NUMBER[token.lowerCaseValue] / Math.pow(10, i);
          }
        });
        break;
      }
      // no default
    }
    sum += subRegionSum;
  });
  return sum;
};

const replaceRegionsInText = (regions, text) => {
  let replaced = text;
  let offset = 0;
  regions.forEach(region => {
    const length = region.end - region.start + 1;
    const replaceWith = getNumber(region);
    replaced = splice(replaced, region.start + offset, length, replaceWith);
    offset -= length - `${replaceWith}`.length;
  });
  return replaced;
};

export default ({ regions, text }) => {
  if (!regions) return text;
  if (regions[0].end - regions[0].start === text.length - 1) return getNumber(regions[0]);
  return replaceRegionsInText(regions, text);
};

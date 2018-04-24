/* eslint-disable no-extra-parens */
import {
  UNIT,
  TEN,
  MAGNITUDE,
  PUNCTUATION_REGEX,
  WHITESPACE_REGEX,
  JOINER_REGEX,
} from './constants';

const getMeta = ({ children: { u, t, m, tu, um, tm, tum } }) => {
  if (u) return u[0].children.Unit[0];
  if (t) return t[0].children.Ten[0];
  if (m) return m[0].children.Magnitude[0];
  if (tu) {
    return {
      startColumn: tu[0].children.Ten[0].startColumn,
      endColumn: tu[0].children.Unit[0].endColumn,
    };
  }
  if (um) {
    return {
      startColumn: um[0].children.Unit[0].startColumn,
      endColumn: um[0].children.Magnitude[0].endColumn,
    };
  }
  if (tm) {
    return {
      startColumn: tm[0].children.Ten[0].startColumn,
      endColumn: tm[0].children.Magnitude[0].endColumn,
    };
  }
  if (tum) {
    return {
      startColumn: tum[0].children.Ten[0].startColumn,
      endColumn: tum[0].children.Magnitude[0].endColumn,
    };
  }
};

const getMagnitude = (magnitudeData) =>
  magnitudeData.reduce((acc, { image }) => acc * MAGNITUDE[image.toLowerCase()], 1);

const compile = ({ type, data }, text) => {
  const addDecimal = (number, decimalData) => {
    if (decimalData) {
      const decimal = compile({ type: 'decimal', data: decimalData[0] }, text);
      return {
        value: number.value + decimal.value,
        region: { startColumn: number.region.startColumn, endColumn: decimal.region.endColumn },
      };
    }
    return number;
  };

  switch (type) {
    case 'groups': {
      const groups = [];

      if (!data) return '';

      data.forEach(datum => {
        const { children: { u, t, m } } = datum;

        if (!groups.length) {
          groups.push([datum]);
          return;
        }

        const lastGroup = groups[groups.length - 1];
        const lastNumberInLastGroup = lastGroup[lastGroup.length - 1];
        const { startColumn } = getMeta(datum);
        const lastEndColumn = getMeta(lastNumberInLastGroup).endColumn;
        const between = text.slice(lastEndColumn, startColumn - 1)
          .replace(' ', '')
          .replace(JOINER_REGEX, '')
          .replace(PUNCTUATION_REGEX, '')
          .replace(WHITESPACE_REGEX, '');

        if (
          (u && lastNumberInLastGroup.children.u) ||
          (t && (lastNumberInLastGroup.children.t || lastNumberInLastGroup.children.u)) ||
          (m && (lastNumberInLastGroup.children.m || lastNumberInLastGroup.children.u)) ||
          between.length
        ) {
          groups.push([datum]);
          return;
        }

        lastGroup.push(datum);
      });

      return groups.map(group => compile({ type: 'numbers', data: group }));
    }
    case 'numbers': {
      const numbers = data.map(({ children: { u, t, m, tu, um, tm, tum, decimal } }) => {
        if (u) return addDecimal(compile({ type: 'u', data: u[0] }, text), decimal);
        if (t) return addDecimal(compile({ type: 't', data: t[0] }, text), decimal);
        if (m) return addDecimal(compile({ type: 'm', data: m[0] }, text), decimal);
        if (tu) return addDecimal(compile({ type: 'tu', data: tu[0] }, text), decimal);
        if (um) return addDecimal(compile({ type: 'um', data: um[0] }, text), decimal);
        if (tm) return addDecimal(compile({ type: 'tm', data: tm[0] }, text), decimal);
        if (tum) return addDecimal(compile({ type: 'tum', data: tum[0] }, text), decimal);
      });
      return numbers.reduce((acc, number) => ({
        region: {
          startColumn: Math.min(number.region.startColumn, acc.region.startColumn),
          endColumn: Math.max(number.region.endColumn, acc.region.endColumn),
        },
        value: acc.value + number.value,
      }), { ...numbers[0], value: 0 });
    }
    case 'u': {
      const { startColumn, endColumn } = data.children.Unit[0];
      return {
        region: { startColumn, endColumn },
        value: UNIT[data.children.Unit[0].image.toLowerCase()]
      };
    }
    case 't': {
      const { startColumn, endColumn } = data.children.Ten[0];
      return {
        region: { startColumn, endColumn },
        value: TEN[data.children.Ten[0].image.toLowerCase()],
      };
    }
    case 'm': {
      const { startColumn, endColumn } = data.children.Magnitude[data.children.Magnitude.length - 1];
      return {
        region: { startColumn, endColumn },
        value: getMagnitude(data.children.Magnitude),
      };
    }
    case 'tu': {
      const { startColumn } = data.children.Ten[0];
      const { endColumn } = data.children.Unit[0];
      return {
        region: { startColumn, endColumn },
        value: TEN[data.children.Ten[0].image.toLowerCase()] +
          UNIT[data.children.Unit[0].image.toLowerCase()],
      };
    }
    case 'um': {
      const { startColumn } = data.children.Unit[0];
      const { endColumn } = data.children.Magnitude[data.children.Magnitude.length - 1];
      return {
        region: { startColumn, endColumn },
        value: getMagnitude(data.children.Magnitude) *
          UNIT[data.children.Unit[0].image.toLowerCase()],
      };
    }
    case 'tm': {
      const { startColumn } = data.children.Ten[0];
      const { endColumn } = data.children.Magnitude[data.children.Magnitude.length - 1];
      return {
        region: { startColumn, endColumn },
        value: getMagnitude(data.children.Magnitude) *
          TEN[data.children.Ten[0].image.toLowerCase()],
      };
    }
    case 'tum': {
      const { startColumn } = data.children.Ten[0];
      const { endColumn } = data.children.Magnitude[data.children.Magnitude.length - 1];
      return {
        region: { startColumn, endColumn },
        value: getMagnitude(data.children.Magnitude) * (
          TEN[data.children.Ten[0].image.toLowerCase()] +
          UNIT[data.children.Unit[0].image.toLowerCase()]
        ),
      };
    }
    case 'decimal': {
      const { startColumn } = data.children.Decimal[0];
      const { endColumn } = data.children.u[data.children.u.length - 1].children.Unit[0];
      return {
        region: { startColumn, endColumn },
        value: data.children.u.reduce((acc, u, i) =>
          acc + (UNIT[u.children.Unit[0].image.toLowerCase()] / Math.pow(10, i + 1))
        , 0),
      };
    }
    // no default
  }
};

export default (data, text) => compile({ type: 'groups', data }, text);

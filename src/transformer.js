const splice = (str, index, count, add) => {
  let i = index;
  if (i < 0) {
    i = str.length + i;
    if (i < 0) {
      i = 0;
    }
  }
  return str.slice(0, i) + (add || '') + str.slice(i + count);
};

export default (numbers, text) => {
  if (numbers[0].region.startColumn === 1 && text.length === numbers[0].region.endColumn) {
    return numbers[0].value;
  }
  let result = text;
  let offset = 0;
  numbers.forEach(({ region: { startColumn, endColumn }, value }) => {
    const count = endColumn - startColumn + 1;
    result = splice(result, startColumn + offset - 1, count, value);
    offset += `${value}`.length - count;
  });
  return result;
};

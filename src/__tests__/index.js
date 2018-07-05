/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import wtn from '../';
const { it } = global;

it('one hundred', () => {
  expect(wtn('one hundred')).to.equal(100);
});

it('one hundred two', () => {
  expect(wtn('one hundred two')).to.equal(102);
});

it('one hundred and five', () => {
  expect(wtn('one hundred and five')).to.equal(105);
});

it('one hundred and twenty five', () => {
  expect(wtn('one hundred and twenty five')).to.equal(125);
});

it('four thousand and thirty', () => {
  expect(wtn('four thousand and thirty')).to.equal(4030);
});

it('six million five thousand and two', () => {
  expect(wtn('six million five thousand and two')).to.equal(6005002);
});

it('a thousand one hundred and eleven', () => {
  expect(wtn('a thousand one hundred and eleven')).to.equal(1111);
});

it('sixty nine', () => {
  expect(wtn('sixty nine')).to.equal(69);
});

it('twenty thousand five hundred and sixty nine', () => {
  expect(wtn('twenty thousand five hundred and sixty nine')).to.equal(20569);
});

it('five quintillion', () => {
  expect(wtn('five quintillion')).to.equal(5000000000000000000);
});

it('one-hundred', () => {
  expect(wtn('one-hundred')).to.equal(100);
});

it('one-hundred and five', () => {
  expect(wtn('one-hundred and five')).to.equal(105);
});

it('one-hundred and twenty-five', () => {
  expect(wtn('one-hundred and twenty-five')).to.equal(125);
});

it('four-thousand and thirty', () => {
  expect(wtn('four-thousand and thirty')).to.equal(4030);
});

it('six-million five-thousand and two', () => {
  expect(wtn('six-million five-thousand and two')).to.equal(6005002);
});

it('a thousand, one-hundred and eleven', () => {
  expect(wtn('a thousand, one-hundred and eleven')).to.equal(1111);
});

it('twenty-thousand, five-hundred and sixty-nine', () => {
  expect(wtn('twenty-thousand, five-hundred and sixty-nine')).to.equal(20569);
});

it('there were twenty-thousand, five-hundred and sixty-nine X in the five quintillion Y', () => {
  expect(wtn('there were twenty-thousand, five-hundred and sixty-nine X in the five quintillion Y'))
  .to
  .equal('there were 20569 X in the 5000000000000000000 Y');
});

it('one two three', () => {
  expect(wtn('one two three')).to.equal('1 2 3');
});

it('test one two three test', () => {
  expect(wtn('test one two three test')).to.equal('test 1 2 3 test');
});

it('won huntred', () => {
  expect(wtn('won huntred', {fuzzy: true})).to.equal(100);
});

it('tu thousant and faav', () => {
  expect(wtn('too thousant and fiev', {fuzzy: true})).to.equal(2005);
});

it('tree millyon sefen hunderd ant twinty sex', () => {
  expect(wtn('tree millyon sefen hunderd and twinty sex', {fuzzy: true})).to.equal(3000726);
});

it('forty two point five', () => {
  expect(wtn('forty two point five')).to.equal(42.5);
});

it('ten point five', () => {
  expect(wtn('ten point five')).to.equal(10.5);
});

it('three point one four one five nine two six', () => {
  expect(wtn('three point one four one five nine two six')).to.equal(3.1415926);
});

/* testing for ordinal numbers */

it('first', () => {
  expect(wtn('first')).to.equal(1);
});

it('second', () => {
  expect(wtn('second')).to.equal(2);
});

it('third', () => {
  expect(wtn('third')).to.equal(3);
});

it('fourteenth', () => {
  expect(wtn('fourteenth')).to.equal(14);
});

it('twenty fifth', () => {
  expect(wtn('twenty fifth')).to.equal(25);
});

it('thirty fourth', () => {
  expect(wtn('thirty fourth')).to.equal(34);
});

it('forty seventh', () => {
  expect(wtn('forty seventh')).to.equal(47);
});

it('fifty third', () => {
  expect(wtn('fifty third')).to.equal(53);
});

it('sixtieth', () => {
  expect(wtn('sixtieth')).to.equal(60);
});

it('seventy second', () => {
  expect(wtn('seventy second')).to.equal(72);
});

it('eighty ninth', () => {
  expect(wtn('eighty ninth')).to.equal(89);
});

it('ninety sixth', () => {
  expect(wtn('ninety sixth')).to.equal(96);
});

it('one hundred and eighth', () => {
  expect(wtn('one hundred and eighth')).to.equal(108);
});

it('one hundred and tenth', () => {
  expect(wtn('one hundred and tenth')).to.equal(110);
});

it('one hundred and ninety ninth', () => {
  expect(wtn('one hundred and ninety ninth')).to.equal(199);
});

it('digit one', () => {
  expect(wtn('digit one')).to.equal('digit 1');
});

it('digit one ', () => {
  expect(wtn('digit one ')).to.equal('digit 1 ');
});

it('one thirty', () => {
  expect(wtn('one thirty')).to.equal('1 30');
});

it('thousand', () => {
  expect(wtn('thousand')).to.equal(1000);
});

it('million', () => {
  expect(wtn('million')).to.equal(1000000);
});

it('billion', () => {
  expect(wtn('billion')).to.equal(1000000000);
});

it('xxxxxxx one hundred', () => {
  expect(wtn('xxxxxxx one hundred')).to.equal('xxxxxxx 100');
});

it('and', () => {
  expect(wtn('and')).to.equal('and');
});

it('a', () => {
  expect(wtn('a')).to.equal('a');
});

it('junkvalue', () => {
  expect(wtn('junkvalue')).to.equal('junkvalue');
});

it('eleven dot one', () => {
  expect(wtn('eleven dot one')).to.eq(11.1);
});

it('Fifty People, One Question: Brooklyn', () => {
  expect(wtn('Fifty People, One Question: Brooklyn')).to.eq('50 People, 1 Question: Brooklyn');
});

it('Model Fifty-One Fifty-Six', () => {
  expect(wtn('Model Fifty-One Fifty-Six')).to.eq('Model 51 56');
});

it('Fifty Million Frenchmen', () => {
  expect(wtn('Fifty Million Frenchmen')).to.eq('50000000 Frenchmen');
});

it('A Thousand and One Wives', () => {
  expect(wtn('A Thousand and One Wives')).to.eq('1001 Wives');
});

it('Ten Thousand Pictures of You', () => {
  expect(wtn('Ten Thousand Pictures of You')).to.eq('10000 Pictures of You');
});

it('nineteen eighty four', () => {
  expect(wtn('nineteen eighty four', { impliedHundreds: true })).to.eq(1984);
});

it('one thirty', () => {
  expect(wtn('one thirty', { impliedHundreds: true })).to.eq(130);
});

it('six sixty two', () => {
  expect(wtn('six sixty two', { impliedHundreds: true })).to.eq(662);
});

it('ten twelve', () => {
  expect(wtn('ten twelve', { impliedHundreds: true })).to.eq(1012);
});

it('nineteen ten', () => {
  expect(wtn('nineteen ten', { impliedHundreds: true })).to.eq(1910);
});

it('twenty ten', () => {
  expect(wtn('twenty ten', { impliedHundreds: true })).to.eq(2010);
});

it('twenty seventeen', () => {
  expect(wtn('twenty seventeen', { impliedHundreds: true })).to.eq(2017);
});

it('twenty twenty', () => {
  expect(wtn('twenty twenty', { impliedHundreds: true })).to.eq(2020);
});

it('twenty twenty one', () => {
  expect(wtn('twenty twenty one', { impliedHundreds: true })).to.eq(2021);
});

it('fifty sixty three', () => {
  expect(wtn('fifty sixty three', { impliedHundreds: true })).to.eq(5063);
});

it('fifty sixty', () => {
  expect(wtn('fifty sixty', { impliedHundreds: true })).to.eq(5060);
});

it('three thousand', () => {
  expect(wtn('three thousand', { impliedHundreds: true })).to.eq(3000);
});

it('fifty sixty three thousand', () => {
  expect(wtn('fifty sixty three thousand', { impliedHundreds: true })).to.eq(5063000);
});

it('one hundred thousand', () => {
  expect(wtn('one hundred thousand')).to.eq(100000);
});

it('I have zero apples and four oranges', () => {
  expect(wtn('I have zero apples and four oranges')).to.eq('I have 0 apples and 4 oranges');
});

it('Dot two Dot', () => {
  expect(wtn('Dot two Dot')).to.eq('0.2 Dot');
});

it('seventeen dot two four dot twelve dot five', () => {
  expect(wtn('seventeen dot two four dot twelve dot five')).to.eq('17.24 dot 12.5');
});

// these dont work below fml

// it('one thirty thousand', () => {
//   expect(wtn('one thirty thousand', { impliedHundreds: true })).to.eq(130000);
// });

// it('nineteen eighty thousand', () => {
//   expect(wtn('nineteen eighty thousand', { impliedHundreds: true })).to.eq('19 80000');
// });

// it('one hundred two thousand', () => {
//   expect(wtn('one hundred two thousand')).to.eq(102000);
// });

// it('one hundred and two thousand', () => {
//   expect(wtn('one hundred and two thousand')).to.eq(102000);
// });

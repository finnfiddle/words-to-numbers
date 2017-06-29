/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import wtn from '../';
const { it } = global;

it('one hundred', () => {
  expect(wtn('one hundred')).to.equal(100);
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

/* edge cases that should return nulls  */
it('and', () => {
  expect(wtn('and')).to.equal(null);
});

it('a', () => {
  expect(wtn('a')).to.equal(null);
});

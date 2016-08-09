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

it('won huntred', () => {
  expect(wtn('won huntred', {fuzzy: true})).to.equal(100);
});

it('tu thousant and faav', () => {
  expect(wtn('too thousant and fiev', {fuzzy: true})).to.equal(2005);
});

it('tree millyon sefen hunderd ant twinty sex', () => {
  expect(wtn('tree millyon sefen hunderd and twinty sex', {fuzzy: true})).to.equal(3000726);
});

it('ten point five', () => {
  expect(wtn('ten point five')).to.equal(10.5);
});

it('three point one four one five nine two six', () => {
  expect(wtn('three point one four one five nine two six')).to.equal(3.1415926);
});

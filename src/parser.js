import { Parser } from 'chevrotain';

import { tokensArray, tokens } from './lexer';

export default class WordsToNumbersParser extends Parser {
  constructor (input) {
    super(input, tokensArray, {
      recoveryEnabled: true,
      outputCst: true
    });

    this.RULE('parse', () => {
      this.MANY(() => {
        this.SUBRULE(this.number);
      });
    });

    this.RULE('number', () => {
      this.OR([
        { ALT: () => { this.SUBRULE(this.tum); } },
        { ALT: () => { this.SUBRULE(this.tm); } },
        { ALT: () => { this.SUBRULE(this.tu); } },
        { ALT: () => { this.SUBRULE(this.m); } },
        { ALT: () => { this.SUBRULE(this.t); } },
        { ALT: () => { this.SUBRULE(this.um); } },
        { ALT: () => { this.SUBRULE(this.u); } },
      ]);
      this.MANY(() => {
        this.SUBRULE(this.decimal);
      });
    });

    this.RULE('u', () => {
      this.CONSUME(tokens.Unit);
    });

    this.RULE('t', () => {
      this.CONSUME(tokens.Ten);
    });

    this.RULE('m', () => {
      this.AT_LEAST_ONE(() => {
        this.CONSUME(tokens.Magnitude);
      });
    });

    this.RULE('tu', () => {
      this.CONSUME(tokens.Ten);
      this.CONSUME(tokens.Unit);
    });

    this.RULE('um', () => {
      this.CONSUME(tokens.Unit);
      this.AT_LEAST_ONE(() => {
        this.CONSUME(tokens.Magnitude);
      });
    });

    this.RULE('tm', () => {
      this.CONSUME(tokens.Ten);
      this.AT_LEAST_ONE(() => {
        this.CONSUME(tokens.Magnitude);
      });
    });

    this.RULE('tum', () => {
      this.CONSUME(tokens.Ten);
      this.CONSUME(tokens.Unit);
      this.AT_LEAST_ONE(() => {
        this.CONSUME(tokens.Magnitude);
      });
    });

    this.RULE('decimal', () => {
      this.CONSUME(tokens.Decimal);
      this.MANY(() => { this.SUBRULE(this.u); });
    });

    Parser.performSelfAnalysis(this);
  }

}

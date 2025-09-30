import { javascript, runRuleTester } from '../utils/rule-tester.js'
import rule from './max-nested-describe.js'

const messageId = 'exceededMaxDepth'

runRuleTester('max-nested-describe', rule, {
  invalid: [
    {
      code: javascript`
        test.describe('foo', function() {
          test.describe('bar', function () {
            test.describe('baz', function () {
              test.describe('qux', function () {
                test.describe('quxx', function () {
                  test.describe('over limit', function () {
                    test('should get something', () => {
                      expect(getSomething()).toBe('Something');
                    });
                  });
                });
              });
            });
          });
        });
      `,
      errors: [{ column: 11, endColumn: 24, endLine: 6, line: 6, messageId }],
    },
    {
      code: javascript`
        describe('foo', function() {
          describe('bar', function () {
            describe('baz', function () {
              describe('qux', function () {
                describe('quxx', function () {
                  describe('over limit', function () {
                    test('should get something', () => {
                      expect(getSomething()).toBe('Something');
                    });
                  });
                });
              });
            });
          });
        });
      `,
      errors: [{ column: 11, endColumn: 19, endLine: 6, line: 6, messageId }],
    },
    {
      code: javascript`
        test.describe('foo', () => {
          test.describe('bar', () => {
            test["describe"]('baz', () => {
              test.describe('baz1', () => {
                test.describe('baz2', () => {
                  test[\`describe\`]('baz3', () => {
                    test('should get something', () => {
                      expect(getSomething()).toBe('Something');
                    });
                  });

                  test.describe('baz4', () => {
                    it('should get something', () => {
                      expect(getSomething()).toBe('Something');
                    });
                  });
                });
              });
            });

            test.describe('qux', function () {
              test('should get something', () => {
                expect(getSomething()).toBe('Something');
              });
            });
          })
        });
      `,
      errors: [
        { column: 11, endColumn: 27, endLine: 6, line: 6, messageId },
        { column: 11, endColumn: 24, endLine: 12, line: 12, messageId },
      ],
      options: [{ max: 5 }],
    },
    {
      code: javascript`
        test.describe.only('foo', function() {
          test.describe('bar', function() {
            test.describe('baz', function() {
              test.describe('qux', function() {
                test.describe('quux', function() {
                  test.describe.only('quuz', function() { });
                });
              });
            });
          });
        });
      `,
      errors: [{ column: 11, endColumn: 29, endLine: 6, line: 6, messageId }],
    },
    {
      code: javascript`
        test.describe.serial.only('foo', function() {
          test.describe('bar', function() {
            test.describe('baz', function() {
              test.describe('qux', function() {
                test.describe('quux', function() {
                  test.describe('quuz', function() { });
                });
              });
            });
          });
        });
      `,
      errors: [{ column: 11, endColumn: 24, endLine: 6, line: 6, messageId }],
    },
    {
      code: javascript`
        test.describe('qux', () => {
          test('should get something', () => {
            expect(getSomething()).toBe('Something');
          });
        });
      `,
      errors: [{ column: 1, endColumn: 14, endLine: 1, line: 1, messageId }],
      options: [{ max: 0 }],
    },
    {
      code: javascript`
        test.describe('foo', () => {
          test.describe('bar', () => {
            test.describe('baz', () => {
              test("test1", () => {
                expect(true).toBe(true);
              });
              test("test2", () => {
                expect(true).toBe(true);
              });
            });
          });
        });
      `,
      errors: [{ column: 5, endColumn: 18, endLine: 3, line: 3, messageId }],
      options: [{ max: 2 }],
    },
    {
      code: javascript`
        it.describe('foo', function() {
          it.describe('bar', function () {
            it.describe('baz', function () {
              it.describe('qux', function () {
                it.describe('quxx', function () {
                  it.describe('over limit', function () {
                    it('should get something', () => {
                      expect(getSomething()).toBe('Something');
                    });
                  });
                });
              });
            });
          });
        });
      `,
      errors: [{ column: 11, endColumn: 22, endLine: 6, line: 6, messageId }],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    'test.describe("describe tests", () => {});',
    'test.describe.only("describe focus tests", () => {});',
    'test.describe.serial.only("describe serial focus tests", () => {});',
    'test.describe.serial.skip("describe serial focus tests", () => {});',
    'test.describe.parallel.fixme("describe serial focus tests", () => {});',
    {
      code: javascript`
        test('foo', function () {
          expect(true).toBe(true);
        });
        test('bar', () => {
          expect(true).toBe(true);
        });
      `,
      options: [{ max: 0 }],
    },
    {
      code: javascript`
        test.describe('foo', function() {
          test.describe('bar', function () {
            test.describe('baz', function () {
              test.describe('qux', function () {
                test.describe('quxx', function () {
                  test('should get something', () => {
                    expect(getSomething()).toBe('Something');
                  });
                });
              });
            });
          });
        });
      `,
    },
    {
      code: javascript`
        test.describe('foo', () => {
          test.describe('bar', () => {
            test.describe('baz', () => {
              test.describe('qux', () => {
                test('foo', () => {
                  expect(someCall().property).toBe(true);
                });
                test('bar', () => {
                  expect(universe.answer).toBe(42);
                });
              });
              test.describe('quxx', () => {
                test('baz', () => {
                  expect(2 + 2).toEqual(4);
                });
              });
            });
          });
        });
      `,
      options: [{ max: 4 }],
    },
    {
      code: javascript`
        test.describe('foo', () => {
          test.describe.only('bar', () => {
            test.describe.skip('baz', () => {
              test('something', async () => {
                expect('something').toBe('something');
              });
            });
          });
        });
      `,
      options: [{ max: 3 }],
    },
    {
      code: javascript`
        describe('foo', () => {
          describe.only('bar', () => {
            describe.skip('baz', () => {
              test('something', async () => {
                expect('something').toBe('something');
              });
            });
          });
        });
      `,
      options: [{ max: 3 }],
    },
    {
      code: javascript`
        it.describe('foo', () => {
          it.describe.only('bar', () => {
            it.describe.skip('baz', () => {
              it('something', async () => {
                expect('something').toBe('something');
              });
            });
          });
        });
      `,
      options: [{ max: 3 }],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
})

import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './max-nested-describe.js'

const messageId = 'exceededMaxDepth'

runRuleTester('max-nested-describe', rule, {
  invalid: [
    {
      code: dedent`
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
      code: dedent`
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
      code: dedent`
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
      code: dedent`
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
      code: dedent`
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
      code: dedent`
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
      code: dedent`
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
      code: dedent`
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
    {
      code: dedent`
        const custom = test.extend({});
        custom.describe('qux', () => {
          custom('should get something', () => {
            expect(getSomething()).toBe('Something');
          });
        });
      `,
      errors: [{ column: 1, endColumn: 16, endLine: 2, line: 2, messageId }],
      options: [{ max: 0 }],
    },
    {
      code: dedent`
        import { test as custom } from '@playwright/test';
        custom.describe('qux', () => {
          custom('should get something', () => {
            expect(getSomething()).toBe('Something');
          });
        });
      `,
      errors: [{ column: 1, endColumn: 16, endLine: 2, line: 2, messageId }],
      options: [{ max: 0 }],
    },
  ],
  valid: [
    'test.describe("describe tests", () => {});',
    'test.describe.only("describe focus tests", () => {});',
    'test.describe.serial.only("describe serial focus tests", () => {});',
    'test.describe.serial.skip("describe serial focus tests", () => {});',
    'test.describe.parallel.fixme("describe serial focus tests", () => {});',
    {
      code: dedent`
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
      code: dedent`
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
      code: dedent`
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
      code: dedent`
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
      code: dedent`
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
      code: dedent`
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
    {
      code: dedent`
        const custom = test.extend({});
        custom.describe('foo', () => {
          custom.describe.only('bar', () => {
            custom.describe.skip('baz', () => {
              custom('something', async () => {
                expect('something').toBe('something');
              });
            });
          });
        });
      `,
      options: [{ max: 3 }],
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom('foo', function () {
          expect(true).toBe(true);
        });
      `,
      options: [{ max: 0 }],
    },
    {
      code: dedent`
        import { test as custom } from '@playwright/test';
        custom('foo', function () {
          expect(true).toBe(true);
        });
      `,
      options: [{ max: 0 }],
    },
  ],
})

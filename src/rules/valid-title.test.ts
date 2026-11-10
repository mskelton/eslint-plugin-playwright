import dedent from 'dedent'
import { Linter } from 'eslint'
import { expect, test } from 'vitest'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './valid-title.js'

runRuleTester('valid-title', rule, {
  invalid: [
    {
      code: 'test("the correct way to properly handle all things", () => {});',
      errors: [
        {
          column: 6,
          data: { word: 'correct' },
          line: 1,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['correct', 'properly', 'all'] }],
    },
    {
      code: 'test.describe("the correct way to do things", function () {})',
      errors: [
        {
          column: 15,
          data: { word: 'correct' },
          line: 1,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['correct'] }],
    },
    {
      code: 'test("has ALL the things", () => {})',
      errors: [
        {
          column: 6,
          data: { word: 'ALL' },
          line: 1,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['all'] }],
    },
    {
      code: "test.describe('Very Descriptive Title Goes Here', function () {})",
      errors: [
        {
          column: 15,
          data: { word: 'Descriptive' },
          line: 1,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['descriptive'] }],
    },
    {
      code: 'test(`that the value is set properly`, function () {})',
      errors: [
        {
          column: 6,
          data: { word: 'properly' },
          line: 1,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['properly'] }],
    },
    {
      code: 'test.step(`that the value is set properly`, function () {})',
      errors: [
        {
          column: 11,
          data: { word: 'properly' },
          line: 1,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['properly'] }],
    },
    {
      code: 'test.step.skip(`that the value is set properly`, function () {})',
      errors: [
        {
          column: 16,
          data: { word: 'properly' },
          line: 1,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['properly'] }],
    },
    // Global aliases
    {
      code: 'it("the correct way to properly handle all things", () => {});',
      errors: [
        {
          column: 4,
          data: { word: 'correct' },
          line: 1,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['correct', 'properly', 'all'] }],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({ myFixture: async ({}, use) => { await use('') } });
        custom("the correct way to do things", () => {});
      `,
      errors: [
        {
          column: 8,
          data: { word: 'correct' },
          line: 2,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['correct'] }],
    },
    {
      code: dedent`
        const custom = test.extend({ myFixture: async ({}, use) => { await use('') } });
        custom.describe("the correct way to do things", () => {});
      `,
      errors: [
        {
          column: 17,
          data: { word: 'correct' },
          line: 2,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['correct'] }],
    },
    {
      code: dedent`
        import { test as custom } from '@playwright/test';
        custom("the correct way to do things", () => {});
      `,
      errors: [
        {
          column: 8,
          data: { word: 'correct' },
          line: 2,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['correct'] }],
    },
  ],
  valid: [
    'test.describe("the correct way to properly handle all the things", () => {});',
    'test.describe.configure({ mode: "parallel" })',
    'test.describe(() => {})',
    'test.describe.only(() => {})',
    'test("that all is as it should be", () => {});',
    'test.use({ locale: "en-US" })',
    'test.only("that all is as it should be", () => {});',
    'test.skip("that all is as it should be", () => {});',
    'test.skip(({ browserName }) => browserName === "Chrome");',
    'test.skip();',
    'test.skip(true);',
    'test.slow(true, "Always");',
    'test.skip(browserName === "Chrome", "This feature is skipped on Chrome")',
    'test.slow("that all is as it should be", () => {});',
    'test.slow(true);',
    'test.slow(({ browserName }) => browserName === "Chrome");',
    'test.slow();',
    'test.slow(browserName === "webkit", "This feature is slow on Mac")',
    {
      code: 'test("correctly sets the value", () => {});',
      options: [{ disallowedWords: ['correct'], ignoreTypeOfDescribeName: false }],
    },
    {
      code: 'test("correctly sets the value", () => {});',
      options: [{ disallowedWords: undefined }],
    },
    // Global aliases
    {
      code: 'test("that all is as it should be", () => {});',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    {
      code: 'test.describe("the correct way to properly handle all the things", () => {});',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({ myFixture: async ({}, use) => { await use('') } });
        custom("that all is as it should be", () => {});
      `,
    },
    {
      code: dedent`
        const custom = test.extend({ myFixture: async ({}, use) => { await use('') } });
        custom.describe("the correct way to properly handle all the things", () => {});
      `,
    },
    {
      code: dedent`
        import { test as custom } from '@playwright/test';
        custom("that all is as it should be", () => {});
      `,
    },
  ],
})

runRuleTester('mustMatch & mustNotMatch options', rule, {
  invalid: [
    {
      code: dedent`
        test.describe('things to test', () => {
          test.describe('unit tests #unit', () => {
            test('is true', () => {
              expect(true).toBe(true);
            });
          });

          test.describe('e2e tests #e4e', () => {
            test('is another test #e2e #playwright4life', () => {
              test.step('#wow', () => {});
            });
          });
        });
      `,
      errors: [
        {
          column: 17,
          data: {
            functionName: 'describe',
            pattern: /(?:#(?!unit|e2e))\w+/u.toString(),
          },
          line: 8,
          messageId: 'mustNotMatch',
        },
        {
          column: 10,
          data: {
            functionName: 'test',
            pattern: /(?:#(?!unit|e2e))\w+/u.toString(),
          },
          line: 9,
          messageId: 'mustNotMatch',
        },
        {
          column: 17,
          data: {
            functionName: 'step',
            pattern: /(?:#(?!unit|e2e))\w+/u.toString(),
          },
          line: 10,
          messageId: 'mustNotMatch',
        },
      ],
      options: [
        {
          mustMatch: /^[^#]+$|(?:#(?:unit|e2e))/u.source,
          mustNotMatch: /(?:#(?!unit|e2e))\w+/u.source,
        },
      ],
    },
    {
      code: dedent`
        test.describe('things to test', () => {
          test.describe('unit tests #unit', () => {
            test('is true', () => {
              expect(true).toBe(true);
            });
          });

          test.describe('e2e tests #e4e', () => {
            test('is another test #e2e #playwright4life', () => {
              test.step('#wow', () => {});
            });
          });
        });
      `,
      errors: [
        {
          column: 17,
          data: {
            functionName: 'describe',
            message: 'Please include "#unit" or "#e2e" in titles',
            pattern: /(?:#(?!unit|e2e))\w+/u.toString(),
          },
          line: 8,
          messageId: 'mustNotMatchCustom',
        },
        {
          column: 10,
          data: {
            functionName: 'test',
            message: 'Please include "#unit" or "#e2e" in titles',
            pattern: /(?:#(?!unit|e2e))\w+/u.toString(),
          },
          line: 9,
          messageId: 'mustNotMatchCustom',
        },
        {
          column: 17,
          data: {
            message: 'Please include "#unit" or "#e2e" in titles',
            pattern: /(?:#(?!unit|e2e))\w+/u.toString(),
          },
          line: 10,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [
        {
          mustMatch: [
            /^[^#]+$|(?:#(?:unit|e2e))/u.source,
            'Please include "#unit" or "#e2e" in titles',
          ],
          mustNotMatch: [
            /(?:#(?!unit|e2e))\w+/u.source,
            'Please include "#unit" or "#e2e" in titles',
          ],
        },
      ],
    },
    {
      code: dedent`
        test.describe('things to test', () => {
          test.describe('unit tests #unit', () => {
            test('is true', () => {
              expect(true).toBe(true);
            });
          });

          test.describe('e2e tests #e4e', () => {
            test('is another test #e2e #playwright4life', () => {
              test.step('#wow', () => {});
            });
          });
        });
      `,
      errors: [
        {
          column: 17,
          data: {
            functionName: 'describe',
            pattern: /(?:#(?!unit|e2e))\w+/u.toString(),
          },
          line: 8,
          messageId: 'mustNotMatch',
        },
      ],
      options: [
        {
          mustMatch: { describe: /^[^#]+$|(?:#(?:unit|e2e))/u.source },
          mustNotMatch: { describe: [/(?:#(?!unit|e2e))\w+/u.source] },
        },
      ],
    },
    {
      code: dedent`
        test.describe('things to test', () => {
          test.describe('unit tests #unit', () => {
            test('is true', () => {
              expect(true).toBe(true);
            });
          });

          test.describe('e2e tests #e4e', () => {
            test('is another test #e2e #playwright4life', () => {
              test.step('#wow', () => {});
            });
          });
        });
      `,
      errors: [
        {
          column: 17,
          data: {
            functionName: 'describe',
            message: 'Please include "#unit" or "#e2e" in describe titles',
            pattern: /(?:#(?!unit|e2e))\w+/u.toString(),
          },
          line: 8,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [
        {
          mustMatch: { describe: /^[^#]+$|(?:#(?:unit|e2e))/u.source },
          mustNotMatch: {
            describe: [
              /(?:#(?!unit|e2e))\w+/u.source,
              'Please include "#unit" or "#e2e" in describe titles',
            ],
          },
        },
      ],
    },
    {
      code: dedent`
        test.describe('things to test', () => {
          test.describe('unit tests #unit', () => {
            test('is true', () => {
              expect(true).toBe(true);
            });
          });

          test.describe('e2e tests #e4e', () => {
            test('is another test #e2e #playwright4life', () => {
              test.step('#wow', () => {});
            });
          });
        });
      `,
      errors: [
        {
          column: 17,
          data: {
            functionName: 'describe',
            pattern: /(?:#(?!unit|e2e))\w+/u.toString(),
          },
          line: 8,
          messageId: 'mustNotMatch',
        },
      ],
      options: [
        {
          mustMatch: { test: /^[^#]+$|(?:#(?:unit|e2e))/u.source },
          mustNotMatch: { describe: /(?:#(?!unit|e2e))\w+/u.source },
        },
      ],
    },
    {
      code: dedent`
        test.describe('things to test', () => {
          test.describe('unit tests #unit', () => {
            test('is true #playwright4life', () => {
              expect(true).toBe(true);
            });
          });

          test.describe('e2e tests #e4e', () => {
            test('is another test #e2e #playwright4life', () => {
              test.step('#wow', () => {});
            });
          });
        });
      `,
      errors: [
        {
          column: 10,
          data: {
            functionName: 'test',
            message: 'Please include "#unit" or "#e2e" in it titles',
            pattern: /^[^#]+$|(?:#(?:unit|e2e))/u.toString(),
          },
          line: 3,
          messageId: 'mustMatchCustom',
        },
        {
          column: 17,
          data: {
            functionName: 'describe',
            message: 'Please include "#unit" or "#e2e" in describe titles',
            pattern: /(?:#(?!unit|e2e))\w+/u.toString(),
          },
          line: 8,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [
        {
          mustMatch: {
            test: [
              /^[^#]+$|(?:#(?:unit|e2e))/u.source,
              'Please include "#unit" or "#e2e" in it titles',
            ],
          },
          mustNotMatch: {
            describe: [
              /(?:#(?!unit|e2e))\w+/u.source,
              'Please include "#unit" or "#e2e" in describe titles',
            ],
          },
        },
      ],
    },
    {
      code: 'test("the correct way to properly handle all things", () => {});',
      errors: [
        {
          column: 6,
          data: {
            functionName: 'test',
            pattern: /#(?:unit|integration|e2e)/u.toString(),
          },
          line: 1,
          messageId: 'mustMatch',
        },
      ],
      options: [{ mustMatch: /#(?:unit|integration|e2e)/u.source }],
    },
    {
      code: 'test.describe("the test", () => {});',
      errors: [
        {
          column: 15,
          data: {
            functionName: 'describe',
            pattern: /#(?:unit|integration|e2e)/u.toString(),
          },
          line: 1,
          messageId: 'mustMatch',
        },
      ],
      options: [{ mustMatch: { describe: /#(?:unit|integration|e2e)/u.source } }],
    },
    {
      code: 'test.step("the test", () => {});',
      errors: [
        {
          column: 11,
          data: {
            functionName: 'step',
            pattern: /#(?:unit|integration|e2e)/u.toString(),
          },
          line: 1,
          messageId: 'mustMatch',
        },
      ],
      options: [{ mustMatch: { step: /#(?:unit|integration|e2e)/u.source } }],
    },
    {
      code: 'test.describe.skip("the test", () => {});',
      errors: [
        {
          column: 20,
          data: {
            functionName: 'describe',
            pattern: /#(?:unit|integration|e2e)/u.toString(),
          },
          line: 1,
          messageId: 'mustMatch',
        },
      ],
      options: [{ mustMatch: { describe: /#(?:unit|integration|e2e)/u.source } }],
    },
    // Global aliases
    {
      code: dedent`
        it.describe('things to test', () => {
          it.describe('unit tests #unit', () => {
            it('is true', () => {
              expect(true).toBe(true);
            });
          });

          it.describe('e2e tests #e4e', () => {
            it('is another test #e2e #playwright4life', () => {});
          });
        });
      `,
      errors: [
        {
          column: 15,
          data: {
            functionName: 'describe',
            pattern: /(?:#(?!unit|e2e))\w+/u.toString(),
          },
          line: 8,
          messageId: 'mustNotMatch',
        },
        {
          column: 8,
          data: {
            functionName: 'test',
            pattern: /(?:#(?!unit|e2e))\w+/u.toString(),
          },
          line: 9,
          messageId: 'mustNotMatch',
        },
      ],
      options: [
        {
          mustMatch: /^[^#]+$|(?:#(?:unit|e2e))/u.source,
          mustNotMatch: /(?:#(?!unit|e2e))\w+/u.source,
        },
      ],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    'test.describe("the correct way to properly handle all the things", () => {});',
    'test("that all is as it should be", () => {});',
    {
      code: 'test("correctly sets the value", () => {});',
      options: [{ mustMatch: {} }],
    },
    {
      code: 'test("correctly sets the value", () => {});',
      options: [{ mustMatch: / /u.source }],
    },
    {
      code: 'test("correctly sets the value", () => {});',
      options: [{ mustMatch: [/ /u.source] }],
    },
    {
      code: 'test("correctly sets the value #unit", () => {});',
      options: [{ mustMatch: /#(?:unit|integration|e2e)/u.source }],
    },
    {
      code: 'test("correctly sets the value", () => {});',
      options: [{ mustMatch: /^[^#]+$|(?:#(?:unit|e2e))/u.source }],
    },
    {
      code: 'test("correctly sets the value", () => {});',
      options: [{ mustMatch: { describe: /#(?:unit|integration|e2e)/u.source } }],
    },
    {
      code: 'test.step("correctly sets the value", () => {});',
      options: [{ mustMatch: { describe: /#(?:unit|integration|e2e)/u.source } }],
    },
    {
      code: dedent`
        test.describe('things to test', () => {
          test.describe('unit tests #unit', () => {
            test('is true #unit', () => {
              expect(true).toBe(true);
            });
          });

          test.describe('e2e tests #e2e', () => {
            test('is another test #e2e', () => {});
          });
        });
      `,
      options: [{ mustMatch: { test: /^[^#]+$|(?:#(?:unit|e2e))/u.source } }],
    },
    // Global aliases
    {
      code: 'it("that all is as it should be", () => {});',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
})

runRuleTester('title-must-be-string', rule, {
  invalid: [
    {
      code: 'test(String(/.+/), () => {});',
      errors: [
        {
          column: 6,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
      options: [{ ignoreTypeOfTestName: false }],
    },
    {
      code: 'test(123, () => {});',
      errors: [
        {
          column: 6,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
    {
      code: 'test.only(123, () => {});',
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
    {
      code: 'test(1 + 2 + 3, () => {});',
      errors: [
        {
          column: 6,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
    {
      code: 'test.only(1 + 2 + 3, () => {});',
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
    {
      code: 'test.skip(123, () => {});',
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
      options: [{ ignoreTypeOfDescribeName: true }],
    },
    {
      code: 'test.describe(String(/.+/), () => {});',
      errors: [
        {
          column: 15,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
    {
      code: 'test.describe(6, function () {})',
      errors: [
        {
          column: 15,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
    {
      code: 'test.describe.skip(123, () => {});',
      errors: [
        {
          column: 20,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
    {
      code: 'test.step(123, () => {});',
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
      options: [{ ignoreTypeOfStepName: false }],
    },
    // Basic semantic analysis
    {
      code: dedent`
        const title = 123;
        test(title, () => {
          expect(1).toBe(1);
        });
      `,
      errors: [
        {
          column: 15,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
    // Global aliases
    {
      code: 'it(String(/.+/), () => {});',
      errors: [
        {
          column: 4,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
      options: [{ ignoreTypeOfTestName: false }],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    'test("is a string", () => {});',
    'test("is" + " a " + " string", () => {});',
    'test(1 + " + " + 1, () => {});',
    'test(`${myFunc} is a string`, () => {});',
    'test.describe("is a string", () => {});',
    'test.describe(() => {});',
    'test.describe.skip("is a string", () => {});',
    'test.describe.skip(`${myFunc} is a string`, () => {});',
    'test.step(123, () => {});',
    {
      code: 'test.describe(String(/.+/), () => {});',
      options: [{ ignoreTypeOfDescribeName: true }],
    },
    {
      code: 'test(String(/.+/), () => {});',
      options: [{ ignoreTypeOfTestName: true }],
    },
    {
      code: 'test.describe(myFunction, () => {});',
      options: [{ ignoreTypeOfDescribeName: true }],
    },
    {
      code: 'test.describe(skipFunction, () => {});',
      options: [{ disallowedWords: [], ignoreTypeOfDescribeName: true }],
    },
    // Basic semantic analysis
    {
      code: 'const foo = "my-title"; test(foo, () => {});',
      options: [{ ignoreTypeOfTestName: true }],
    },
    {
      code: 'const foo = "my-title"; test(foo, () => {});',
      options: [{ ignoreTypeOfTestName: false }],
    },
    {
      code: dedent`
        const title = "is a string";
        test(title, () => {
          expect(1).toBe(1);
        });
      `,
    },
    // Destructured variables from loops - cannot trace type, should not error
    {
      code: dedent`
        const cases = [{ name: 'test one' }, { name: 'test two' }];
        for (const { name } of cases) {
          test(name, () => {
            expect(1).toBe(1);
          });
        }
      `,
    },
    // Destructured in forEach callback
    {
      code: dedent`
        const cases = [{ name: 'test one' }];
        cases.forEach(({ name }) => {
          test(name, () => {});
        });
      `,
    },
    // Destructured from array index
    {
      code: dedent`
        const cases = [{ name: 'test one' }];
        const { name } = cases[0];
        test(name, () => {});
      `,
    },
    // Array destructuring
    {
      code: dedent`
        const cases = ['test one', 'test two'];
        for (const name of cases) {
          test(name, () => {});
        }
      `,
    },
    // Member expression access (cases[0].name)
    {
      code: dedent`
        const cases = [{ name: 'test one' }];
        test(cases[0].name, () => {});
      `,
    },
    // describe with destructured variable
    {
      code: dedent`
        const suites = [{ name: 'suite one' }];
        for (const { name } of suites) {
          test.describe(name, () => {
            test('inner', () => {});
          });
        }
      `,
    },
    // Global aliases
    {
      code: 'it("is a string", () => {});',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
})

runRuleTester('no-empty-title', rule, {
  invalid: [
    {
      code: 'test.describe("", function () {})',
      errors: [
        {
          column: 1,
          data: { functionName: 'describe' },
          line: 1,
          messageId: 'emptyTitle',
        },
      ],
    },
    {
      code: dedent`
        test.describe('foo', () => {
          test('', () => {});
        });
      `,
      errors: [
        {
          column: 3,
          data: { functionName: 'test' },
          line: 2,
          messageId: 'emptyTitle',
        },
      ],
    },
    {
      code: 'test("", function () {})',
      errors: [
        {
          column: 1,
          data: { functionName: 'test' },
          line: 1,
          messageId: 'emptyTitle',
        },
      ],
    },
    {
      code: 'test.only("", function () {})',
      errors: [
        {
          column: 1,
          data: { functionName: 'test' },
          line: 1,
          messageId: 'emptyTitle',
        },
      ],
    },
    {
      code: 'test(``, function () {})',
      errors: [
        {
          column: 1,
          data: { functionName: 'test' },
          line: 1,
          messageId: 'emptyTitle',
        },
      ],
    },
    {
      code: 'test.only(``, function () {})',
      errors: [
        {
          column: 1,
          data: { functionName: 'test' },
          line: 1,
          messageId: 'emptyTitle',
        },
      ],
    },
    {
      code: 'test.step(``, function () {})',
      errors: [
        {
          column: 1,
          data: { functionName: 'step' },
          line: 1,
          messageId: 'emptyTitle',
        },
      ],
    },
    // Global aliases
    {
      code: 'it.describe("", function () {})',
      errors: [
        {
          column: 1,
          data: { functionName: 'describe' },
          line: 1,
          messageId: 'emptyTitle',
        },
      ],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    'test.describe()',
    'someFn("", function () {})',
    'test.describe("foo", function () {})',
    'test.describe("foo", function () { test("bar", function () {}) })',
    'test("foo", function () {})',
    'test.only("foo", function () {})',
    'test(`foo`, function () {})',
    'test.skip(`foo`, function () {})',
    'test(`${foo}`, function () {})',
    'test.fixme(`${foo}`, function () {})',
    'test.step(`${foo}`, function () {})',
    // Global aliases
    {
      code: 'test.describe()',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
})

runRuleTester('no-accidental-space', rule, {
  invalid: [
    {
      code: 'test.describe(" foo", function () {})',
      errors: [{ column: 15, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.describe("foo", function () {})',
    },
    {
      code: 'test.describe(" foo foe fum", function () {})',
      errors: [{ column: 15, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.describe("foo foe fum", function () {})',
    },
    {
      code: 'test.describe("foo foe fum ", function () {})',
      errors: [{ column: 15, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.describe("foo foe fum", function () {})',
    },
    {
      code: "test.describe(' foo', function () {})",
      errors: [{ column: 15, line: 1, messageId: 'accidentalSpace' }],
      output: "test.describe('foo', function () {})",
    },
    {
      code: 'test(" foo", function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test("foo", function () {})',
    },
    {
      code: 'test.only(" foo", function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.only("foo", function () {})',
    },
    {
      code: 'test.skip(" foo", function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.skip("foo", function () {})',
    },
    {
      code: 'test("foo ", function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test("foo", function () {})',
    },
    {
      code: 'test.skip("foo ", function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.skip("foo", function () {})',
    },
    {
      code: 'test(` foo`, function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test(`foo`, function () {})',
    },
    {
      code: 'test.only(` foo`, function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.only(`foo`, function () {})',
    },
    {
      code: 'test(` foo bar bang`, function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test(`foo bar bang`, function () {})',
    },
    {
      code: 'test.only(` foo bar bang`, function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.only(`foo bar bang`, function () {})',
    },
    {
      code: 'test(` foo bar bang  `, function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test(`foo bar bang`, function () {})',
    },
    {
      code: 'test.only(` foo bar bang  `, function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.only(`foo bar bang`, function () {})',
    },
    {
      code: 'test(" foo  ", function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test("foo", function () {})',
    },
    {
      code: 'test.step(` foo bar bang  `, function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.step(`foo bar bang`, function () {})',
    },
    {
      code: 'test.step(" foo", function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.step("foo", function () {})',
    },
    {
      code: 'test.step(" foo  ", function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.step("foo", function () {})',
    },
    {
      code: dedent`
        test.describe(' foo', () => {
          test('bar', () => {})
        })
      `,
      errors: [{ column: 15, line: 1, messageId: 'accidentalSpace' }],
      output: dedent`
        test.describe('foo', () => {
          test('bar', () => {})
        })
      `,
    },
    {
      code: dedent`
        test.describe('foo', () => {
          test(' bar', () => {})
        })
      `,
      errors: [{ column: 8, line: 2, messageId: 'accidentalSpace' }],
      output: dedent`
        test.describe('foo', () => {
          test('bar', () => {})
        })
      `,
    },
    // Global aliases
    {
      code: 'it.describe(" foo", function () {})',
      errors: [{ column: 13, line: 1, messageId: 'accidentalSpace' }],
      output: 'it.describe("foo", function () {})',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    'someFn("foo", function () {})',
    'test()',
    'test("foo", function () {})',
    'test.describe()',
    'test.describe("foo", function () {})',
    'test.step()',
    'test.step("foo", function () {})',
    'test.only()',
    'test.only("foo", function () {})',
    dedent`
      test.describe('foo', () => {
        test('bar', () => {})
      })
    `,
    {
      code: 'test(`GIVEN... \n  `, () => {});',
      options: [{ ignoreSpaces: true }],
    },
    // Global aliases
    {
      code: 'it("foo", function () {})',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
})

runRuleTester('no-duplicate-prefix describe', rule, {
  invalid: [
    {
      code: 'test.describe("describe foo", function () {})',
      errors: [{ column: 15, line: 1, messageId: 'duplicatePrefix' }],
      output: 'test.describe("foo", function () {})',
    },
    {
      code: "test.describe('describe foo', function () {})",
      errors: [{ column: 15, line: 1, messageId: 'duplicatePrefix' }],
      output: "test.describe('foo', function () {})",
    },
    {
      code: 'test.describe(`describe foo`, function () {})',
      errors: [{ column: 15, line: 1, messageId: 'duplicatePrefix' }],
      output: 'test.describe(`foo`, function () {})',
    },
    // Global aliases
    {
      code: 'it.describe("describe foo", function () {})',
      errors: [{ column: 13, line: 1, messageId: 'duplicatePrefix' }],
      output: 'it.describe("foo", function () {})',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    'test.describe("foo", function () {})',
    // Global aliases
    {
      code: 'it.describe("foo", function () {})',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
})

runRuleTester('no-duplicate-prefix test', rule, {
  invalid: [
    {
      code: 'test("test", function () {})',
      errors: [{ column: 6, line: 1, messageId: 'duplicatePrefix' }],
      output: null,
    },
    {
      code: 'test("test foo", function () {})',
      errors: [{ column: 6, line: 1, messageId: 'duplicatePrefix' }],
      output: 'test("foo", function () {})',
    },
    {
      code: 'test(`test foo`, function () {})',
      errors: [{ column: 6, line: 1, messageId: 'duplicatePrefix' }],
      output: 'test(`foo`, function () {})',
    },
    {
      code: 'test(`test foo test`, function () {})',
      errors: [{ column: 6, line: 1, messageId: 'duplicatePrefix' }],
      output: 'test(`foo test`, function () {})',
    },
    // Global aliases
    {
      code: 'it("test foo", function () {})',
      errors: [{ column: 4, line: 1, messageId: 'duplicatePrefix' }],
      output: 'it("foo", function () {})',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    'test("foo", function () {})',
    "test('foo', function () {})",
    'test(`foo`, function () {})',
    'test("foo test", function () {})',
    // Global aliases
    {
      code: 'it("foo", function () {})',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
})

runRuleTester('no-duplicate-prefix step', rule, {
  invalid: [
    {
      code: 'test.step("step foo", function () {})',
      errors: [{ column: 11, line: 1, messageId: 'duplicatePrefix' }],
      output: 'test.step("foo", function () {})',
    },
    {
      code: "test.step('step foo', function () {})",
      errors: [{ column: 11, line: 1, messageId: 'duplicatePrefix' }],
      output: "test.step('foo', function () {})",
    },
    {
      code: 'test.step(`step foo`, function () {})',
      errors: [{ column: 11, line: 1, messageId: 'duplicatePrefix' }],
      output: 'test.step(`foo`, function () {})',
    },
  ],
  valid: [
    'test.step("foo", function () {})',
    "test.step('foo', function () {})",
    'test.step(`foo`, function () {})',
  ],
})

runRuleTester('no-duplicate-prefix nested', rule, {
  invalid: [
    {
      code: dedent`
        test.describe('describe foo', () => {
          test('bar', () => {})
        })
      `,
      errors: [{ column: 15, line: 1, messageId: 'duplicatePrefix' }],
      output: dedent`
        test.describe('foo', () => {
          test('bar', () => {})
        })
      `,
    },
    {
      code: dedent`
        test.describe('describe foo', () => {
          test('describes things correctly', () => {})
        })
      `,
      errors: [{ column: 15, line: 1, messageId: 'duplicatePrefix' }],
      output: dedent`
        test.describe('foo', () => {
          test('describes things correctly', () => {})
        })
      `,
    },
    {
      code: dedent`
        test.describe('foo', () => {
          test('test bar', () => {})
        })
      `,
      errors: [{ column: 8, line: 2, messageId: 'duplicatePrefix' }],
      output: dedent`
        test.describe('foo', () => {
          test('bar', () => {})
        })
      `,
    },
    {
      code: dedent`
        test.describe('foo', () => {
          test('bar', () => {
            test.step('step foobar', () => {})
          })
        })
      `,
      errors: [{ column: 15, line: 3, messageId: 'duplicatePrefix' }],
      output: dedent`
        test.describe('foo', () => {
          test('bar', () => {
            test.step('foobar', () => {})
          })
        })
      `,
    },
    // Global aliases
    {
      code: dedent`
        it.describe('describe foo', () => {
          it('bar', () => {})
        })
      `,
      errors: [{ column: 13, line: 1, messageId: 'duplicatePrefix' }],
      output: dedent`
        it.describe('foo', () => {
          it('bar', () => {})
        })
      `,
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    dedent`
      test.describe('foo', () => {
        test('bar', () => {})
      })
    `,
    dedent`
      test.describe('foo', () => {
        test('describes things correctly', () => {})
      })
    `,
    // Global aliases
    {
      code: dedent`
        it.describe('foo', () => {
          it('bar', () => {})
        })
      `,
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
})

const longTaggedTitle = `${'a'.repeat(80)} @slow`
const longTitle = 'a'.repeat(80)

runRuleTester('multiple mustMatch and mustNotMatch patterns', rule, {
  invalid: [
    {
      code: "test('foo bar', () => {});",
      errors: [
        {
          column: 6,
          data: { functionName: 'test', pattern: /foo/u.toString() },
          line: 1,
          messageId: 'mustNotMatch',
        },
        {
          column: 6,
          data: {
            functionName: 'test',
            message: 'mentions bar',
            pattern: /bar/u.toString(),
          },
          line: 1,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [
        {
          mustNotMatch: [['foo'], ['bar', 'mentions bar']],
        },
      ],
    },
    {
      code: dedent`
        test.describe('bad @slow', () => {
          test('bad @slow', () => {
            test.step('bad @slow', () => {})
          })
        })
      `,
      errors: [
        {
          column: 15,
          data: {
            functionName: 'describe',
            message: 'No suffixed tag',
            pattern: /@\w+$/u.toString(),
          },
          line: 1,
          messageId: 'mustNotMatchCustom',
        },
        {
          column: 8,
          data: {
            functionName: 'test',
            message: 'No suffixed tag',
            pattern: /@\w+$/u.toString(),
          },
          line: 2,
          messageId: 'mustNotMatchCustom',
        },
        {
          column: 15,
          data: {
            functionName: 'step',
            message: 'No suffixed tag',
            pattern: /@\w+$/u.toString(),
          },
          line: 3,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [{ mustNotMatch: [['@\\w+$', 'No suffixed tag']] }],
    },
    {
      code: `test.describe('${longTaggedTitle}', () => {});`,
      errors: [
        {
          column: 15,
          data: {
            functionName: 'describe',
            message: 'Title should not be suffixed with a tag, only prefixed',
            pattern: /@\w+$/u.toString(),
          },
          line: 1,
          messageId: 'mustNotMatchCustom',
        },
        {
          column: 15,
          data: {
            functionName: 'describe',
            message: 'Title should be less than 80 chars',
            pattern: /^.{80,}$/u.toString(),
          },
          line: 1,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [
        {
          mustNotMatch: {
            describe: [
              ['@\\w+$', 'Title should not be suffixed with a tag, only prefixed'],
              ['^.{80,}$', 'Title should be less than 80 chars'],
            ],
          },
        },
      ],
    },
    {
      code: "test.describe('short @slow', () => {});",
      errors: [
        {
          column: 15,
          data: {
            functionName: 'describe',
            message: 'Title should not be suffixed with a tag, only prefixed',
            pattern: /@\w+$/u.toString(),
          },
          line: 1,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [
        {
          mustNotMatch: {
            describe: [
              ['@\\w+$', 'Title should not be suffixed with a tag, only prefixed'],
              ['^.{80,}$', 'Title should be less than 80 chars'],
            ],
          },
        },
      ],
    },
    {
      code: `test.describe('${longTitle}', () => {});`,
      errors: [
        {
          column: 15,
          data: {
            functionName: 'describe',
            message: 'Title should be less than 80 chars',
            pattern: /^.{80,}$/u.toString(),
          },
          line: 1,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [
        {
          mustNotMatch: {
            describe: [
              ['@\\w+$', 'Title should not be suffixed with a tag, only prefixed'],
              ['^.{80,}$', 'Title should be less than 80 chars'],
            ],
          },
        },
      ],
    },
    {
      code: "test('short @slow', () => {});",
      errors: [
        {
          column: 6,
          data: {
            functionName: 'test',
            message: 'No suffixed tag',
            pattern: /@\w+$/u.toString(),
          },
          line: 1,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [
        {
          mustNotMatch: {
            test: [
              ['@\\w+$', 'No suffixed tag'],
              ['^.{20,}$', 'Title should be less than 20 chars'],
            ],
          },
        },
      ],
    },
    {
      code: "test.step('too long @slow', () => {});",
      errors: [
        {
          column: 11,
          data: { functionName: 'step', pattern: /@\w+$/u.toString() },
          line: 1,
          messageId: 'mustNotMatch',
        },
        {
          column: 11,
          data: {
            functionName: 'step',
            message: 'Title should be less than 10 chars',
            pattern: /^.{10,}$/u.toString(),
          },
          line: 1,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [
        {
          mustNotMatch: {
            step: [['@\\w+$'], ['^.{10,}$', 'Title should be less than 10 chars']],
          },
        },
      ],
    },
    {
      code: "test('work', () => {});",
      errors: [
        {
          column: 6,
          data: {
            functionName: 'test',
            message: 'Title should start with Please',
            pattern: /^Please/u.toString(),
          },
          line: 1,
          messageId: 'mustMatchCustom',
        },
        {
          column: 6,
          data: {
            functionName: 'test',
            message: 'Title should end with !',
            pattern: /!$/u.toString(),
          },
          line: 1,
          messageId: 'mustMatchCustom',
        },
      ],
      options: [
        {
          mustMatch: {
            test: [
              ['^Please', 'Title should start with Please'],
              ['!$', 'Title should end with !'],
            ],
          },
        },
      ],
    },
    {
      code: "test.describe('Please work', () => {});",
      errors: [
        {
          column: 15,
          data: {
            functionName: 'describe',
            message: 'Title should end with !',
            pattern: /!$/u.toString(),
          },
          line: 1,
          messageId: 'mustMatchCustom',
        },
      ],
      options: [
        {
          mustMatch: {
            describe: [
              ['^Please', 'Title should start with Please'],
              ['!$', 'Title should end with !'],
            ],
          },
        },
      ],
    },
    {
      code: "test.step('work', () => {});",
      errors: [
        {
          column: 11,
          data: { functionName: 'step', pattern: /^Please/u.toString() },
          line: 1,
          messageId: 'mustMatch',
        },
        {
          column: 11,
          data: { functionName: 'step', pattern: /!$/u.toString() },
          line: 1,
          messageId: 'mustMatch',
        },
      ],
      options: [{ mustMatch: { step: [['^Please'], ['!$']] } }],
    },
    {
      code: dedent`
        test.describe('bad!', () => {
          test('bad.', () => {
            test.step('Skip me @slow', () => {})
          })
        })
      `,
      errors: [
        {
          column: 15,
          data: { functionName: 'describe', pattern: /!$/u.toString() },
          line: 1,
          messageId: 'mustNotMatch',
        },
        {
          column: 8,
          data: {
            functionName: 'test',
            message: 'Titles should not end with a full stop',
            pattern: /\.$/u.toString(),
          },
          line: 2,
          messageId: 'mustNotMatchCustom',
        },
        {
          column: 15,
          data: { functionName: 'step', pattern: /@\w+$/u.toString() },
          line: 3,
          messageId: 'mustNotMatch',
        },
        {
          column: 15,
          data: {
            functionName: 'step',
            message: 'Do not start a step with Skip',
            pattern: /^Skip/u.toString(),
          },
          line: 3,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [
        {
          mustNotMatch: {
            describe: '!$',
            step: [['@\\w+$'], ['^Skip', 'Do not start a step with Skip']],
            test: ['\\.$', 'Titles should not end with a full stop'],
          },
        },
      ],
    },
    {
      code: "test('nope @slow', () => {});",
      errors: [
        {
          column: 6,
          data: {
            functionName: 'test',
            message: 'No suffixed tag',
            pattern: /@\w+$/u.toString(),
          },
          line: 1,
          messageId: 'mustNotMatchCustom',
        },
        {
          column: 6,
          data: {
            functionName: 'test',
            message: 'Title should be less than 5 chars',
            pattern: /^.{5,}$/u.toString(),
          },
          line: 1,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [
        {
          mustMatch: { test: ['^Please', 'Title should start with Please'] },
          mustNotMatch: {
            test: [
              ['@\\w+$', 'No suffixed tag'],
              ['^.{5,}$', 'Title should be less than 5 chars'],
            ],
          },
        },
      ],
    },
    {
      code: "test('hello', () => {});",
      errors: [
        {
          column: 6,
          data: {
            functionName: 'test',
            message: 'Title should start with Please',
            pattern: /^Please/u.toString(),
          },
          line: 1,
          messageId: 'mustMatchCustom',
        },
      ],
      options: [
        {
          mustMatch: { test: ['^Please', 'Title should start with Please'] },
          mustNotMatch: { test: [['@\\w+$', 'No suffixed tag']] },
        },
      ],
    },
    {
      code: "test('name @slow', () => {});",
      errors: [
        {
          column: 6,
          data: {
            functionName: 'test',
            message: 'No suffixed tag',
            pattern: /@\w+$/u.toString(),
          },
          line: 1,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [{ mustNotMatch: { test: [['@\\w+$', 'No suffixed tag']] } }],
    },
    {
      code: "it('too long @slow', () => {});",
      errors: [
        {
          column: 4,
          data: {
            functionName: 'test',
            message: 'No suffixed tag',
            pattern: /@\w+$/u.toString(),
          },
          line: 1,
          messageId: 'mustNotMatchCustom',
        },
        {
          column: 4,
          data: {
            functionName: 'test',
            message: 'Title should be less than 10 chars',
            pattern: /^.{10,}$/u.toString(),
          },
          line: 1,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [
        {
          mustNotMatch: {
            test: [
              ['@\\w+$', 'No suffixed tag'],
              ['^.{10,}$', 'Title should be less than 10 chars'],
            ],
          },
        },
      ],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    {
      code: "test('bar baz', () => {});",
      options: [{ mustNotMatch: ['foo', 'bar'] }],
    },
    {
      code: "test('Please work!', () => {});",
      options: [
        {
          mustMatch: {
            test: [
              ['^Please', 'Title should start with Please'],
              ['!$', 'Title should end with !'],
            ],
          },
        },
      ],
    },
    {
      code: "test.describe('short title', () => {});",
      options: [
        {
          mustNotMatch: {
            describe: [
              ['@\\w+$', 'Title should not be suffixed with a tag, only prefixed'],
              ['^.{80,}$', 'Title should be less than 80 chars'],
            ],
          },
        },
      ],
    },
    {
      code: dedent`
        test.describe('short title', () => {
          test('short @slow', () => {
            test.step('${longTitle}', () => {})
          })
        })
      `,
      options: [
        {
          mustNotMatch: {
            describe: [
              ['@\\w+$', 'Title should not be suffixed with a tag, only prefixed'],
              ['^.{80,}$', 'Title should be less than 80 chars'],
            ],
          },
        },
      ],
    },
    {
      code: dedent`
        test.describe('Suite', () => {
          test('Please work!', () => {
            test.step('Given a user', () => {})
          })
        })
      `,
      options: [
        {
          mustMatch: {
            describe: [['^[A-Z]']],
            step: [['^Given ']],
            test: [['^Please'], ['!$']],
          },
        },
      ],
    },
    {
      code: dedent`
        test.describe('Please work!', () => {
          test('Please work!', () => {
            test.step('Please work!', () => {})
          })
        })
      `,
      options: [
        {
          mustMatch: [['^Please'], ['!$']],
          mustNotMatch: [['@\\w+$']],
        },
      ],
    },
    {
      code: dedent`
        test.describe('Suite', () => {
          test('Please work', () => {
            test.step('Given a user', () => {})
          })
        })
      `,
      options: [
        {
          mustMatch: {
            describe: '^[A-Z]',
            step: [['^Given ']],
            test: ['^Please', 'Title should start with Please'],
          },
        },
      ],
    },
    {
      code: "test('Please work', () => {});",
      options: [
        {
          mustMatch: { test: [['^Please'], ['work$']] },
          mustNotMatch: { test: [['@\\w+$'], ['^.{40,}$']] },
        },
      ],
    },
    {
      code: "test('name', () => {});",
      options: [{ mustNotMatch: { test: [['@\\w+$', 'No suffixed tag']] } }],
    },
    {
      code: "test.step('Given a user', () => {});",
      options: [{ mustMatch: { step: ['^Given ', 'Step titles should start with Given'] } }],
    },
  ],
})

const lintTitle = (options: unknown) => {
  const linter = new Linter()

  return linter.verify("test('hello', () => {})", {
    plugins: {
      playwright: {
        rules: {
          'valid-title': rule,
        },
      },
    },
    rules: {
      'playwright/valid-title': ['error', options],
    },
  })
}

const acceptedMatcherOptions: Array<[string, unknown]> = [
  ['string pattern', { mustNotMatch: '@\\w+$' }],
  ['pattern without a message', { mustNotMatch: ['@\\w+$'] }],
  ['pattern with a message', { mustNotMatch: ['@\\w+$', 'No suffixed tag'] }],
  [
    'object of strings and tuples',
    { mustMatch: { describe: '^That', step: 'Given', test: ['^Please'] } },
  ],
  [
    'lists mixed with a single pattern',
    {
      mustNotMatch: {
        describe: [
          ['@\\w+$', 'Title should not be suffixed with a tag, only prefixed'],
          ['^.{80,}$', 'Title should be less than 80 chars'],
        ],
        step: '^Given',
        test: [['@\\w+$'], ['^.{80,}$', 'Title should be less than 80 chars']],
      },
    },
  ],
  [
    'top level list',
    {
      mustMatch: [['^Please', 'Title should start with Please'], ['!$']],
    },
  ],
  ['empty object', { mustMatch: {} }],
]

for (const [label, options] of acceptedMatcherOptions) {
  test(`accepts ${label}`, () => {
    expect(() => lintTitle(options)).not.toThrow()
  })
}

const rejectedMatcherOptions: Array<[string, unknown]> = [
  ['three strings', { mustNotMatch: ['a', 'b', 'c'] }],
  ['string mixed with a pair', { mustNotMatch: ['a', ['b', 'c']] }],
  ['unknown group', { mustNotMatch: { it: 'a' } }],
  ['empty list', { mustNotMatch: [] }],
  ['empty list on a key', { mustMatch: { test: [] } }],
  ['three strings on a key', { mustNotMatch: { test: ['a', 'b', 'c'] } }],
  ['pair with three items', { mustNotMatch: { describe: [['a', 'b', 'c']] } }],
  ['non string pattern', { mustNotMatch: { step: [[1, 'msg']] } }],
  ['pattern object', { mustMatch: { test: { source: 'a' } } }],
  ['null', { mustNotMatch: null }],
  ['pair mixed with a bare string', { mustMatch: [['ok', 'message'], 'bare'] }],
  ['unknown option', { extra: true, mustNotMatch: 'a' }],
]

for (const [label, options] of rejectedMatcherOptions) {
  test(`rejects ${label}`, () => {
    expect(() => lintTitle(options)).toThrow(/valid-title/)
  })
}

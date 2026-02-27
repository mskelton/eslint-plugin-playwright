import dedent from 'dedent'
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
      name: 'Single-word duplicate prefix reports but does not autofix',
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

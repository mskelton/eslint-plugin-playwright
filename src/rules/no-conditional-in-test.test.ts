import { javascript, runRuleTester } from '../utils/rule-tester.js'
import rule from './no-conditional-in-test.js'

const messageId = 'conditionalInTest'

runRuleTester('no-conditional-in-test', rule, {
  invalid: [
    {
      code: 'test("foo", () => { if (true) { expect(1).toBe(1); } });',
      errors: [{ column: 21, endColumn: 53, endLine: 1, line: 1, messageId }],
    },
    {
      code: javascript`
        test.describe("foo", () => {
          test("bar", () => {
            if (someCondition()) {
              expect(1).toBe(1);
            } else {
              expect(2).toBe(2);
            }
          });
        });
      `,
      errors: [{ column: 5, endColumn: 6, endLine: 7, line: 3, messageId }],
    },
    {
      code: javascript`
        describe('foo', () => {
          test('bar', () => {
            if ('bar') {}
          })
        })
      `,
      errors: [{ column: 5, endColumn: 18, endLine: 3, line: 3, messageId }],
    },
    {
      code: javascript`
        describe('foo', () => {
          test('bar', () => {
            if ('bar') {}
          })
          test('baz', () => {
            if ('qux') {}
            if ('quux') {}
          })
        })
      `,
      errors: [
        { column: 5, endColumn: 18, endLine: 3, line: 3, messageId },
        { column: 5, endColumn: 18, endLine: 6, line: 6, messageId },
        { column: 5, endColumn: 19, endLine: 7, line: 7, messageId },
      ],
    },
    {
      code: javascript`
        test("foo", function () {
          switch(someCondition()) {
            case 1:
              expect(1).toBe(1);
              break;
            case 2:
              expect(2).toBe(2);
              break;
          }
        });
      `,
      errors: [{ column: 3, endColumn: 4, endLine: 9, line: 2, messageId }],
    },
    {
      code: javascript`
        test('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [{ column: 3, endColumn: 16, endLine: 2, line: 2, messageId }],
    },
    {
      code: javascript`
        test('foo', () => {
          bar ? expect(1).toBe(1) : expect(2).toBe(2);
        })
      `,
      errors: [{ column: 3, endColumn: 46, endLine: 2, line: 2, messageId }],
    },
    {
      code: javascript`
        test('foo', function () {
          bar ? expect(1).toBe(1) : expect(2).toBe(2);
        })
      `,
      errors: [{ column: 3, endColumn: 46, endLine: 2, line: 2, messageId }],
    },
    {
      code: javascript`
        test('foo', function () {
          if ('bar') {}
        })
      `,
      errors: [{ column: 3, endColumn: 16, endLine: 2, line: 2, messageId }],
    },
    {
      code: javascript`
        test('foo', async function ({ page }) {
          await asyncFunc();
          if ('bar') {}
        })
      `,
      errors: [{ column: 3, endColumn: 16, endLine: 3, line: 3, messageId }],
    },
    {
      code: javascript`
        test.skip('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [{ column: 3, endColumn: 16, endLine: 2, line: 2, messageId }],
    },
    {
      code: javascript`
        test.skip('foo', async ({ page }) => {
          await asyncFunc();
          if ('bar') {}
        })
      `,
      errors: [{ column: 3, endColumn: 16, endLine: 3, line: 3, messageId }],
    },
    {
      code: javascript`
        test.skip('foo', function () {
          if ('bar') {}
        })
      `,
      errors: [{ column: 3, endColumn: 16, endLine: 2, line: 2, messageId }],
    },
    {
      code: javascript`
        test.only('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [{ column: 3, endColumn: 16, endLine: 2, line: 2, messageId }],
    },
    {
      code: javascript`
        test.fixme('foo', () => {
          if ('bar') {}
        })
      `,
      errors: [{ column: 3, endColumn: 16, endLine: 2, line: 2, messageId }],
    },
    {
      code: javascript`
        test('foo', () => {
          callExpression()
          if ('bar') {}
        })
      `,
      errors: [{ column: 3, endColumn: 16, endLine: 3, line: 3, messageId }],
    },
    {
      code: javascript`
        testDetails.forEach((detail) => {
          test(detail.name, () => {
            if (detail.fail) {
              test.fail();
            } else {
              expect(true).toBe(true);
            }
          })
        });
      `,
      errors: [{ column: 5, endColumn: 6, endLine: 7, line: 3, messageId }],
    },
    {
      code: javascript`
        test('test', async ({ page }) => {
          await test.step('step', async () => {
            if (true) {}
          });
        });
      `,
      errors: [{ column: 5, endColumn: 17, endLine: 3, line: 3, messageId }],
    },
    {
      code: javascript`
        test('test', async ({ page }) => {
          await test.step.skip('step', async () => {
            if (true) {}
          });
        });
      `,
      errors: [{ column: 5, endColumn: 17, endLine: 3, line: 3, messageId }],
    },
    {
      code: 'it("foo", () => { if (true) { expect(1).toBe(1); } });',
      errors: [{ column: 19, endColumn: 51, endLine: 1, line: 1, messageId }],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    'test("foo", () => { expect(1).toBe(1); });',
    'test.fixme("some broken test", () => { expect(1).toBe(1); });',
    'test.describe("foo", () => { if(true) { test("bar", () => { expect(true).toBe(true); }); } });',
    'test.skip(process.env.APP_VERSION === "v1", "There are no settings in v1");',
    'test("some slow test", () => { test.slow(); })',
    'const foo = bar ? foo : baz;',
    `test.describe('foo', () => {
        test.afterEach(() => {
          if ('bar') {}
        });
      })`,
    `test.describe('foo', () => {
        test.beforeEach(() => {
          if ('bar') {}
        });
      })`,
    `test.describe('foo', function () {
        test.beforeEach(function () {
          if ('bar') {}
        });
      })`,
    `test.describe.parallel('foo', function () {
        test.beforeEach(function () {
          if ('bar') {}
        });
      })`,
    `test.describe.parallel.only('foo', function () {
        test.beforeEach(function () {
          if ('bar') {}
        });
      })`,
    `test.describe.serial('foo', function () {
        test.beforeEach(function () {
          if ('bar') {}
        });
      })`,
    `test.describe.serial.only('foo', function () {
        test.beforeEach(function () {
          if ('bar') {}
        });
      })`,
    `const values = something.map((thing) => {
        if (thing.isFoo) {
          return thing.foo
        } else {
          return thing.bar;
        }
      });

      test.describe('valid', () => {
        test('still valid', () => {
          expect(values).toStrictEqual(['foo']);
        });
      });`,
    `describe('valid', () => {
        const values = something.map((thing) => {
          if (thing.isFoo) {
            return thing.foo
          } else {
            return thing.bar;
          }
        });

        test.describe('still valid', () => {
          test('really still valid', () => {
            expect(values).toStrictEqual(['foo']);
          });
        });
      });`,
    // Conditionals are only disallowed at the root level. Nested conditionals
    // are common and valid.
    `test('nested', async ({ page }) => {
      const [request] = await Promise.all([
        page.waitForRequest(request => request.url() === 'foo' && request.method() === 'GET'),
        page.click('button'),
      ]);
    })`,
    `test('nested', async ({ page }) => {
      await page.waitForRequest(request => request.url() === 'foo' && request.method() === 'GET')
    })`,
    `test.fixme('nested', async ({ page }) => {
      await page.waitForRequest(request => request.url() === 'foo' && request.method() === 'GET')
    })`,
    `test.only('nested', async ({ page }) => {
      await page.waitForRequest(request => request.url() === 'foo' && request.method() === 'GET')
    })`,
    `test('nested', () => {
      test.skip(true && false)
    })`,
    `test('nested', () => {
      test.skip(
        ({ baseURL }) => (baseURL || "").includes("localhost"),
        "message",
      )
    })`,
    `test('test', async ({ page }) => {
      await test.step('step', async () => {
        await page.waitForRequest(request => request.url() === 'foo' && request.method() === 'GET')
      });
    })`,
    // Global aliases
    {
      code: 'it("foo", () => { expect(1).toBe(1); });',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    // Issue 363: conditionals in test metadata should not trigger the rule
    `test('My Test', { tag: productType === 'XYZ' ? '@regression' : '@smoke' }, () => {
      expect(1).toBe(1);
    })`,
  ],
})

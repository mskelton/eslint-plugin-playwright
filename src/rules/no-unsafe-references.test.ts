import {
  javascript,
  runRuleTester,
  runTSRuleTester,
  typescript,
} from '../utils/rule-tester.js'
import rule from './no-unsafe-references.js'

const messageId = 'noUnsafeReference'

runRuleTester('no-unsafe-references', rule, {
  invalid: [
    {
      code: javascript`
        const x = 10
        const result = await page.evaluate(() => {
          return Promise.resolve(x);
        });
      `,
      errors: [
        {
          column: 26,
          data: { method: 'evaluate', variable: 'x' },
          line: 3,
          messageId,
        },
      ],
      name: 'Single argument - missing arg list - arrow function - evaluate',
      output: javascript`
        const x = 10
        const result = await page.evaluate(([x]) => {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: javascript`
        const x = 10
        const result = await page.addInitScript(() => {
          return Promise.resolve(x);
        });
      `,
      errors: [
        {
          column: 26,
          data: { method: 'addInitScript', variable: 'x' },
          line: 3,
          messageId,
        },
      ],
      name: 'Single argument - missing arg list - arrow function - addInitScript',
      output: javascript`
        const x = 10
        const result = await page.addInitScript(([x]) => {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: javascript`
        const x = 10
        const result = await page.evaluate(function () {
          return Promise.resolve(x);
        });
      `,
      errors: [
        {
          column: 26,
          data: { method: 'evaluate', variable: 'x' },
          line: 3,
          messageId,
        },
      ],
      name: 'Single argument - missing arg list - function - evaluate',
      output: javascript`
        const x = 10
        const result = await page.evaluate(function ([x]) {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: javascript`
        const x = 10
        const result = await page.addInitScript(function () {
          return Promise.resolve(x);
        });
      `,
      errors: [
        {
          column: 26,
          data: { method: 'addInitScript', variable: 'x' },
          line: 3,
          messageId,
        },
      ],
      name: 'Single argument - missing arg list - function - addInitScript',
      output: javascript`
        const x = 10
        const result = await page.addInitScript(function ([x]) {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: javascript`
        const x = 10
        const result = await page.evaluate(() => {
          return Promise.resolve(x);
        }, []);
      `,
      errors: [
        {
          column: 26,
          data: { method: 'evaluate', variable: 'x' },
          line: 3,
          messageId,
        },
      ],
      name: 'Single argument - empty arg list - arrow function - evaluate',
      output: javascript`
        const x = 10
        const result = await page.evaluate(([x]) => {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: javascript`
        const x = 10
        const result = await page.addInitScript(() => {
          return Promise.resolve(x);
        }, []);
      `,
      errors: [
        {
          column: 26,
          data: { method: 'addInitScript', variable: 'x' },
          line: 3,
          messageId,
        },
      ],
      name: 'Single argument - empty arg list - arrow function - addInitScript',
      output: javascript`
        const x = 10
        const result = await page.addInitScript(([x]) => {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: javascript`
        const x = 10
        const result = await page.evaluate(function() {
          return Promise.resolve(x);
        }, []);
      `,
      errors: [
        {
          column: 26,
          data: { method: 'evaluate', variable: 'x' },
          line: 3,
          messageId,
        },
      ],
      name: 'Single argument - empty arg list - function - evaluate',
      output: javascript`
        const x = 10
        const result = await page.evaluate(function([x]) {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: javascript`
        const x = 10
        const result = await page.addInitScript(function() {
          return Promise.resolve(x);
        }, []);
      `,
      errors: [
        {
          column: 26,
          data: { method: 'addInitScript', variable: 'x' },
          line: 3,
          messageId,
        },
      ],
      name: 'Single argument - empty arg list - function - addInitScript',
      output: javascript`
        const x = 10
        const result = await page.addInitScript(function([x]) {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: javascript`
        const foo = 10
        const bar = 20
        const result = await page.evaluate(() => {
          return Promise.resolve(foo + bar);
        }, []);
      `,
      errors: [
        {
          column: 26,
          data: { method: 'evaluate', variable: 'foo' },
          endColumn: 29,
          line: 4,
          messageId: 'noUnsafeReference',
        },
        {
          column: 32,
          data: { method: 'evaluate', variable: 'bar' },
          endColumn: 35,
          line: 4,
          messageId: 'noUnsafeReference',
        },
      ],
      name: 'Multiple arguments - evaluate',
      output: javascript`
        const foo = 10
        const bar = 20
        const result = await page.evaluate(([foo, bar]) => {
          return Promise.resolve(foo + bar);
        }, [foo, bar]);
      `,
    },
    {
      code: javascript`
        const foo = 10
        const bar = 20
        const result = await page.addInitScript(() => {
          return Promise.resolve(foo + bar);
        }, []);
      `,
      errors: [
        {
          column: 26,
          data: { method: 'addInitScript', variable: 'foo' },
          endColumn: 29,
          line: 4,
          messageId: 'noUnsafeReference',
        },
        {
          column: 32,
          data: { method: 'addInitScript', variable: 'bar' },
          endColumn: 35,
          line: 4,
          messageId: 'noUnsafeReference',
        },
      ],
      name: 'Multiple arguments - addInitScript',
      output: javascript`
        const foo = 10
        const bar = 20
        const result = await page.addInitScript(([foo, bar]) => {
          return Promise.resolve(foo + bar);
        }, [foo, bar]);
      `,
    },
    {
      code: javascript`
        const x = 10
        const result = await page.evaluate(() => {
          const y = 20;
          return Promise.resolve(x + y);
        });
      `,
      errors: [
        {
          column: 26,
          data: { method: 'evaluate', variable: 'x' },
          line: 4,
          messageId,
        },
      ],
      name: 'Inner and outer variables - evaluate',
      output: javascript`
        const x = 10
        const result = await page.evaluate(([x]) => {
          const y = 20;
          return Promise.resolve(x + y);
        }, [x]);
      `,
    },
    {
      code: javascript`
        const x = 10
        const result = await page.addInitScript(() => {
          const y = 20;
          return Promise.resolve(x + y);
        });
      `,
      errors: [
        {
          column: 26,
          data: { method: 'addInitScript', variable: 'x' },
          line: 4,
          messageId,
        },
      ],
      name: 'Inner and outer variables - addInitScript',
      output: javascript`
        const x = 10
        const result = await page.addInitScript(([x]) => {
          const y = 20;
          return Promise.resolve(x + y);
        }, [x]);
      `,
    },
    {
      code: javascript`
        const x = 10
        test('test', async () => {
          const y = 10
          const result = await page.evaluate(() => {
            return Promise.resolve(x + y);
          }, []);
        })
      `,
      errors: [
        {
          column: 28,
          data: { method: 'evaluate', variable: 'x' },
          line: 5,
          messageId,
        },
        {
          column: 32,
          data: { method: 'evaluate', variable: 'y' },
          line: 5,
          messageId,
        },
      ],
      name: 'Multi-level scopes - evaluate',
      output: javascript`
        const x = 10
        test('test', async () => {
          const y = 10
          const result = await page.evaluate(([x, y]) => {
            return Promise.resolve(x + y);
          }, [x, y]);
        })
      `,
    },
    {
      code: javascript`
        const x = 10
        test('test', async () => {
          const y = 10
          const result = await page.addInitScript(() => {
            return Promise.resolve(x + y);
          }, []);
        })
      `,
      errors: [
        {
          column: 28,
          data: { method: 'addInitScript', variable: 'x' },
          line: 5,
          messageId,
        },
        {
          column: 32,
          data: { method: 'addInitScript', variable: 'y' },
          line: 5,
          messageId,
        },
      ],
      name: 'Multi-level scopes - addInitScript',
      output: javascript`
        const x = 10
        test('test', async () => {
          const y = 10
          const result = await page.addInitScript(([x, y]) => {
            return Promise.resolve(x + y);
          }, [x, y]);
        })
      `,
    },
    {
      code: javascript`
        const x = 10
        const y = 12
        const result = await page.evaluate(([x]) => {
          return Promise.resolve(x + y);
        }, [x]);
      `,
      errors: [
        {
          column: 30,
          data: { method: 'evaluate', variable: 'y' },
          line: 4,
          messageId,
        },
      ],
      name: 'Adding to existing arg list - evaluate',
      output: javascript`
        const x = 10
        const y = 12
        const result = await page.evaluate(([x, y]) => {
          return Promise.resolve(x + y);
        }, [x, y]);
      `,
    },
    {
      code: javascript`
        const x = 10
        const y = 12
        const result = await page.addInitScript(([x]) => {
          return Promise.resolve(x + y);
        }, [x]);
      `,
      errors: [
        {
          column: 30,
          data: { method: 'addInitScript', variable: 'y' },
          line: 4,
          messageId,
        },
      ],
      name: 'Adding to existing arg list - addInitScript',
      output: javascript`
        const x = 10
        const y = 12
        const result = await page.addInitScript(([x, y]) => {
          return Promise.resolve(x + y);
        }, [x, y]);
      `,
    },
    {
      code: javascript`
        const x = 10
        const y = 12
        const result = await page.evaluate((x) => {
          return Promise.resolve(x + y);
        }, x);
      `,
      errors: [
        {
          column: 30,
          data: { method: 'evaluate', variable: 'y' },
          line: 4,
          messageId,
        },
      ],
      name: 'Converting a single argument to an array - evaluate',
      output: javascript`
        const x = 10
        const y = 12
        const result = await page.evaluate(([x, y]) => {
          return Promise.resolve(x + y);
        }, [x, y]);
      `,
    },
    {
      code: javascript`
        const x = 10
        const y = 12
        const result = await page.addInitScript((x) => {
          return Promise.resolve(x + y);
        }, x);
      `,
      errors: [
        {
          column: 30,
          data: { method: 'addInitScript', variable: 'y' },
          line: 4,
          messageId,
        },
      ],
      name: 'Converting a single argument to an array - addInitScript',
      output: javascript`
        const x = 10
        const y = 12
        const result = await page.addInitScript(([x, y]) => {
          return Promise.resolve(x + y);
        }, [x, y]);
      `,
    },
  ],
  valid: [
    { code: 'page.pause()' },
    { code: 'page.evaluate()' },
    { code: 'page.evaluate("1 + 2")' },
    { code: 'page.addInitScript()' },
    { code: 'page.addInitScript("1 + 2")' },
    {
      code: javascript`
        const x = 10
        const result = await page.evaluate(() => {
          return Promise.resolve(12);
        }, []);
      `,
      name: 'No variables - evaluate',
    },
    {
      code: javascript`
        const x = 10
        const result = await page.addInitScript(() => {
          return Promise.resolve(12);
        }, []);
      `,
      name: 'No variables - addInitScript',
    },
    {
      code: javascript`
        const x = 10
        const result = await page.evaluate(function (x) {
          return Promise.resolve(x);
        }, [x]);
      `,
      name: 'Single argument - evaluate',
    },
    {
      code: javascript`
        const x = 10
        const result = await page.addInitScript(function (x) {
          return Promise.resolve(x);
        }, [x]);
      `,
      name: 'Single argument - addInitScript',
    },
    {
      code: javascript`
        const foo = 10
        const bar = 20
        const result = await page.evaluate(([foo, bar]) => {
          return Promise.resolve(foo, bar);
        }, [foo, bar]);
      `,
      name: 'Multiple arguments - same name - evaluate',
    },
    {
      code: javascript`
        const foo = 10
        const bar = 20
        const result = await page.addInitScript(([foo, bar]) => {
          return Promise.resolve(foo, bar);
        }, [foo, bar]);
      `,
      name: 'Multiple arguments - same name - addInitScript',
    },
    {
      code: javascript`
        const foo = 10
        const bar = 20
        const result = await page.evaluate(([a, b]) => {
          return Promise.resolve(a + b);
        }, [foo, bar]);
      `,
      name: 'Multiple arguments - different name - evaluate',
    },
    {
      code: javascript`
        const foo = 10
        const bar = 20
        const result = await page.addInitScript(([a, b]) => {
          return Promise.resolve(a + b);
        }, [foo, bar]);
      `,
      name: 'Multiple arguments - different name - addInitScript',
    },
    {
      code: javascript`
        const x = 10
        const result = await page.evaluate(() => {
          const x = 20;
          return Promise.resolve(x);
        }, []);
      `,
      name: 'Variable shadowing - evaluate',
    },
    {
      code: javascript`
        const x = 10
        const result = await page.addInitScript(() => {
          const x = 20;
          return Promise.resolve(x);
        }, []);
      `,
      name: 'Variable shadowing - addInitScript',
    },
    {
      code: javascript`
        const x = 10
        const result = await page.evaluate((x) => {
          const y = 20;
          return Promise.resolve(x + y);
        }, [x]);
      `,
      name: 'Inner and outer variables - evaluate',
    },
    {
      code: javascript`
        const x = 10
        const result = await page.addInitScript((x) => {
          const y = 20;
          return Promise.resolve(x + y);
        }, [x]);
      `,
      name: 'Inner and outer variables - addInitScript',
    },
    {
      code: javascript`
        const x = 10
        test('test', async () => {
          const y = 10
          const result = await page.evaluate(([x, y]) => {
            return Promise.resolve(x + y);
          }, [x, y]);
        })
      `,
      name: 'Multi-level scopes - evaluate',
    },
    {
      code: javascript`
        const x = 10
        test('test', async () => {
          const y = 10
          const result = await page.addInitScript(([x, y]) => {
            return Promise.resolve(x + y);
          }, [x, y]);
        })
      `,
      name: 'Multi-level scopes - addInitScript',
    },
  ],
})

runTSRuleTester('no-unsafe-references', rule, {
  invalid: [],
  valid: [
    {
      code: typescript`
        type X = number;
        const result = await page.evaluate(() => {
          const x = 10 as X;
          return Promise.resolve(x);
        });
      `,
      name: 'TypeScript - variable assignment of type - evaluate',
    },
    {
      code: typescript`
        type X = number;
        const result = await page.addInitScript(() => {
          const x = 10 as X;
          return Promise.resolve(x);
        });
      `,
      name: 'TypeScript - variable assignment of type - addInitScript',
    },
    {
      code: typescript`
        type X = number;
        const result = await page.evaluate(() => {
          const foo = (bar: X) => bar;
          return Promise.resolve(foo(10));
        });
      `,
      name: 'TypeScript - parameter type - evaluate',
    },
    {
      code: typescript`
        type X = number;
        const result = await page.addInitScript(() => {
          const foo = (bar: X) => bar;
          return Promise.resolve(foo(10));
        });
      `,
      name: 'TypeScript - parameter type - addInitScript',
    },
    {
      code: typescript`
        type X = number;
        const result = await page.evaluate(() => {
          const x: X = 10;
          return Promise.resolve(x);
        });
      `,
      name: 'TypeScript - casting - evaluate',
    },
    {
      code: typescript`
        type X = number;
        const result = await page.addInitScript(() => {
          const x: X = 10;
          return Promise.resolve(x);
        });
      `,
      name: 'TypeScript - casting - addInitScript',
    },
  ],
})

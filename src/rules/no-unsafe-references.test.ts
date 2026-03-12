import dedent from 'dedent'
import { runRuleTester, runTSRuleTester } from '../utils/rule-tester.js'
import rule from './no-unsafe-references.js'

const messageId = 'noUnsafeReference'

runRuleTester('no-unsafe-references', rule, {
  invalid: [
    {
      code: dedent`
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
      output: dedent`
        const x = 10
        const result = await page.evaluate(([x]) => {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: dedent`
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
      output: dedent`
        const x = 10
        const result = await page.addInitScript(([x]) => {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: dedent`
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
      output: dedent`
        const x = 10
        const result = await page.evaluate(function ([x]) {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: dedent`
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
      output: dedent`
        const x = 10
        const result = await page.addInitScript(function ([x]) {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: dedent`
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
      output: dedent`
        const x = 10
        const result = await page.evaluate(([x]) => {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: dedent`
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
      output: dedent`
        const x = 10
        const result = await page.addInitScript(([x]) => {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: dedent`
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
      output: dedent`
        const x = 10
        const result = await page.evaluate(function([x]) {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: dedent`
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
      output: dedent`
        const x = 10
        const result = await page.addInitScript(function([x]) {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: dedent`
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
      output: dedent`
        const foo = 10
        const bar = 20
        const result = await page.evaluate(([foo, bar]) => {
          return Promise.resolve(foo + bar);
        }, [foo, bar]);
      `,
    },
    {
      code: dedent`
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
      output: dedent`
        const foo = 10
        const bar = 20
        const result = await page.addInitScript(([foo, bar]) => {
          return Promise.resolve(foo + bar);
        }, [foo, bar]);
      `,
    },
    {
      code: dedent`
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
      output: dedent`
        const x = 10
        const result = await page.evaluate(([x]) => {
          const y = 20;
          return Promise.resolve(x + y);
        }, [x]);
      `,
    },
    {
      code: dedent`
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
      output: dedent`
        const x = 10
        const result = await page.addInitScript(([x]) => {
          const y = 20;
          return Promise.resolve(x + y);
        }, [x]);
      `,
    },
    {
      code: dedent`
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
      output: dedent`
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
      code: dedent`
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
      output: dedent`
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
      code: dedent`
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
      output: dedent`
        const x = 10
        const y = 12
        const result = await page.evaluate(([x, y]) => {
          return Promise.resolve(x + y);
        }, [x, y]);
      `,
    },
    {
      code: dedent`
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
      output: dedent`
        const x = 10
        const y = 12
        const result = await page.addInitScript(([x, y]) => {
          return Promise.resolve(x + y);
        }, [x, y]);
      `,
    },
    {
      code: dedent`
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
      output: dedent`
        const x = 10
        const y = 12
        const result = await page.evaluate(([x, y]) => {
          return Promise.resolve(x + y);
        }, [x, y]);
      `,
    },
    {
      code: dedent`
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
      output: dedent`
        const x = 10
        const y = 12
        const result = await page.addInitScript(([x, y]) => {
          return Promise.resolve(x + y);
        }, [x, y]);
      `,
    },
    {
      code: dedent`
        const x = 10
        await page.evaluate(async () => x)
      `,
      errors: [{ column: 33, line: 2, messageId }],
      output: dedent`
        const x = 10
        await page.evaluate(async ([x]) => x, [x])
      `,
    },
    {
      code: dedent`
        const x = 10
        await page["evaluate"](() => x)
      `,
      errors: [{ column: 30, line: 2, messageId }],
      output: dedent`
        const x = 10
        await page["evaluate"](([x]) => x, [x])
      `,
    },
    {
      code: dedent`
        const x = 10
        await page[\`evaluate\`](() => x)
      `,
      errors: [{ column: 30, line: 2, messageId }],
      output: dedent`
        const x = 10
        await page[\`evaluate\`](([x]) => x, [x])
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
      code: dedent`
        const x = 10
        const result = await page.evaluate(() => {
          return Promise.resolve(12);
        }, []);
      `,
    },
    {
      code: dedent`
        const x = 10
        const result = await page.addInitScript(() => {
          return Promise.resolve(12);
        }, []);
      `,
    },
    {
      code: dedent`
        const x = 10
        const result = await page.evaluate(function (x) {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: dedent`
        const x = 10
        const result = await page.addInitScript(function (x) {
          return Promise.resolve(x);
        }, [x]);
      `,
    },
    {
      code: dedent`
        const foo = 10
        const bar = 20
        const result = await page.evaluate(([foo, bar]) => {
          return Promise.resolve(foo, bar);
        }, [foo, bar]);
      `,
    },
    {
      code: dedent`
        const foo = 10
        const bar = 20
        const result = await page.addInitScript(([foo, bar]) => {
          return Promise.resolve(foo, bar);
        }, [foo, bar]);
      `,
    },
    {
      code: dedent`
        const foo = 10
        const bar = 20
        const result = await page.evaluate(([a, b]) => {
          return Promise.resolve(a + b);
        }, [foo, bar]);
      `,
    },
    {
      code: dedent`
        const foo = 10
        const bar = 20
        const result = await page.addInitScript(([a, b]) => {
          return Promise.resolve(a + b);
        }, [foo, bar]);
      `,
    },
    {
      code: dedent`
        const x = 10
        const result = await page.evaluate(() => {
          const x = 20;
          return Promise.resolve(x);
        }, []);
      `,
    },
    {
      code: dedent`
        const x = 10
        const result = await page.addInitScript(() => {
          const x = 20;
          return Promise.resolve(x);
        }, []);
      `,
    },
    {
      code: dedent`
        const x = 10
        const result = await page.evaluate((x) => {
          const y = 20;
          return Promise.resolve(x + y);
        }, [x]);
      `,
    },
    {
      code: dedent`
        const x = 10
        const result = await page.addInitScript((x) => {
          const y = 20;
          return Promise.resolve(x + y);
        }, [x]);
      `,
    },
    {
      code: dedent`
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
      code: dedent`
        const x = 10
        test('test', async () => {
          const y = 10
          const result = await page.addInitScript(([x, y]) => {
            return Promise.resolve(x + y);
          }, [x, y]);
        })
      `,
    },
  ],
})

runTSRuleTester('no-unsafe-references', rule, {
  invalid: [],
  valid: [
    {
      code: dedent`
        type X = number;
        const result = await page.evaluate(() => {
          const x = 10 as X;
          return Promise.resolve(x);
        });
      `,
    },
    {
      code: dedent`
        type X = number;
        const result = await page.addInitScript(() => {
          const x = 10 as X;
          return Promise.resolve(x);
        });
      `,
    },
    {
      code: dedent`
        type X = number;
        const result = await page.evaluate(() => {
          const foo = (bar: X) => bar;
          return Promise.resolve(foo(10));
        });
      `,
    },
    {
      code: dedent`
        type X = number;
        const result = await page.addInitScript(() => {
          const foo = (bar: X) => bar;
          return Promise.resolve(foo(10));
        });
      `,
    },
    {
      code: dedent`
        type X = number;
        const result = await page.evaluate(() => {
          const x: X = 10;
          return Promise.resolve(x);
        });
      `,
    },
    {
      code: dedent`
        type X = number;
        const result = await page.addInitScript(() => {
          const x: X = 10;
          return Promise.resolve(x);
        });
      `,
    },
  ],
})

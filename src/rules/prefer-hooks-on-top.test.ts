import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './prefer-hooks-on-top.js'

runRuleTester('basic describe block', rule, {
  invalid: [
    {
      code: dedent`
        test.describe('foo', () => {
          test.beforeEach(() => {});
          test('bar', () => {
            someFn();
          });

          test.beforeAll(() => {});
          test('bar', () => {
            someFn();
          });
        });
      `,
      errors: [
        {
          column: 3,
          line: 7,
          messageId: 'noHookOnTop',
        },
      ],
    },
    {
      code: dedent`
        test.describe('foo', () => {
          test.beforeEach(() => {});
          test.only('bar', () => {
            someFn();
          });

          test.beforeAll(() => {});
          test.only('bar', () => {
            someFn();
          });
        });
      `,
      errors: [
        {
          column: 3,
          line: 7,
          messageId: 'noHookOnTop',
        },
      ],
    },
    // Global aliases
    {
      code: dedent`
        it.describe('foo', () => {
          it.beforeEach(() => {});
          it('bar', () => {
            someFn();
          });

          it.beforeAll(() => {});
          it('bar', () => {
            someFn();
          });
        });
      `,
      errors: [
        {
          column: 3,
          line: 7,
          messageId: 'noHookOnTop',
        },
      ],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    {
      code: dedent`
        import { test as custom } from '@playwright/test';
        custom.describe('foo', () => {
          custom.beforeEach(() => {});
          custom('bar', () => {
            someFn();
          });

          custom.beforeAll(() => {});
          custom('bar', () => {
            someFn();
          });
        });
      `,
      errors: [
        {
          column: 3,
          line: 8,
          messageId: 'noHookOnTop',
        },
      ],
    },
    {
      code: dedent`
        test.describe('foo', () => {
          test('bar', () => {});
          test.afterEach(() => {});
        });
      `,
      errors: [{ column: 3, line: 3, messageId: 'noHookOnTop' }],
      name: 'afterEach after test should be flagged',
    },
  ],
  valid: [
    dedent`
      test.describe('foo', () => {
        test.beforeEach(() => {});
        someSetupFn();
        test.afterEach(() => {});

        test('bar', () => {
          someFn();
        });
      });
    `,
    dedent`
      test.describe('foo', () => {
        someSetupFn();
        test.beforeEach(() => {});
        test.afterEach(() => {});

        test('bar', () => {
          someFn();
        });
      });
    `,
    // Global aliases
    {
      code: dedent`
        it.describe('foo', () => {
          it.beforeEach(() => {});
          someSetupFn();
          it.afterEach(() => {});

          it('bar', () => {
            someFn();
          });
        });
      `,
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom.describe('foo', () => {
          custom.beforeEach(() => {});
          someSetupFn();
          custom.afterEach(() => {});

          custom('bar', () => {
            someFn();
          });
        });
      `,
    },
    {
      code: dedent`
        import { test as custom } from '@playwright/test';
        custom.describe('foo', () => {
          custom.beforeEach(() => {});
          someSetupFn();
          custom.afterEach(() => {});

          custom('bar', () => {
            someFn();
          });
        });
      `,
    },
  ],
})

runRuleTester('multiple describe blocks', rule, {
  invalid: [
    {
      code: dedent`
        test.describe.skip('foo', () => {
          test.beforeEach(() => {});
          test('bar', () => {
            someFn();
          });

          test.beforeAll(() => {});
          test('bar', () => {
            someFn();
          });
        });
        test.describe('foo', () => {
          test.beforeEach(() => {});
          test.beforeEach(() => {});
          test.beforeAll(() => {});

          test('bar', () => {
            someFn();
          });
        });

        test.describe('foo', () => {
          test('bar', () => {
            someFn();
          });

          test.beforeEach(() => {});
          test.beforeEach(() => {});
          test.beforeAll(() => {});
        });
      `,
      errors: [
        {
          column: 3,
          line: 7,
          messageId: 'noHookOnTop',
        },
        {
          column: 3,
          line: 27,
          messageId: 'noHookOnTop',
        },
        {
          column: 3,
          line: 28,
          messageId: 'noHookOnTop',
        },
        {
          column: 3,
          line: 29,
          messageId: 'noHookOnTop',
        },
      ],
    },
  ],
  valid: [
    dedent`
      test.describe.skip('foo', () => {
        test.beforeEach(() => {});
        test.beforeAll(() => {});

        test('bar', () => {
          someFn();
        });
      });

      test.describe('foo', () => {
        test.beforeEach(() => {});

        test('bar', () => {
          someFn();
        });
      });
    `,
  ],
})

runRuleTester('nested describe blocks', rule, {
  invalid: [
    {
      code: dedent`
        test.describe('foo', () => {
          test.beforeAll(() => {});
          test('bar', () => {
            someFn();
          });

          test.describe('inner_foo', () => {
            test.beforeEach(() => {});
            test('inner bar', () => {
              someFn();
            });

            test('inner bar', () => {
              someFn();
            });

            test.beforeAll(() => {});
            test.afterAll(() => {});
            test('inner bar', () => {
              someFn();
            });
          });
        });
      `,
      errors: [
        {
          column: 5,
          line: 17,
          messageId: 'noHookOnTop',
        },
        {
          column: 5,
          line: 18,
          messageId: 'noHookOnTop',
        },
      ],
    },
  ],
  valid: [
    dedent`
      test.describe('foo', () => {
        test.beforeEach(() => {});
        test('bar', () => {
          someFn();
        });

        test.describe('inner_foo', () => {
          test.beforeEach(() => {});
          test('inner bar', () => {
            someFn();
          });
        });
      });
    `,
  ],
})

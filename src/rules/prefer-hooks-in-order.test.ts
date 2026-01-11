import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './prefer-hooks-in-order.js'

runRuleTester('prefer-hooks-in-order', rule, {
  invalid: [
    {
      code: dedent`
        const withDatabase = () => {
          test.afterAll(() => {
            removeMyDatabase();
          });
          test.beforeAll(() => {
            createMyDatabase();
          });
        };
      `,
      errors: [
        {
          column: 3,
          data: { currentHook: 'beforeAll', previousHook: 'afterAll' },
          line: 5,
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.afterAll(() => {
          removeMyDatabase();
        });
        test.beforeAll(() => {
          createMyDatabase();
        });
      `,
      errors: [
        {
          column: 1,
          data: { currentHook: 'beforeAll', previousHook: 'afterAll' },
          line: 4,
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.afterAll(() => {});
        test.beforeAll(() => {});
      `,
      errors: [
        {
          column: 1,
          data: { currentHook: 'beforeAll', previousHook: 'afterAll' },
          line: 2,
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.afterEach(() => {});
        test.beforeEach(() => {});
      `,
      errors: [
        {
          column: 1,
          data: { currentHook: 'beforeEach', previousHook: 'afterEach' },
          line: 2,
          // 'beforeEach' hooks should be before any 'afterEach' hooks
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.afterEach(() => {});
        test.beforeAll(() => {});
      `,
      errors: [
        {
          column: 1,
          data: { currentHook: 'beforeAll', previousHook: 'afterEach' },
          line: 2,
          // 'beforeAll' hooks should be before any 'afterEach' hooks
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.beforeEach(() => {});
        test.beforeAll(() => {});
      `,
      errors: [
        {
          column: 1,
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          line: 2,
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.afterAll(() => {});
        test.afterEach(() => {});
      `,
      errors: [
        {
          column: 1,
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          line: 2,
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.afterAll(() => {});
        // The afterEach should do this
        // This comment does not matter for the order
        test.afterEach(() => {});
      `,
      errors: [
        {
          column: 1,
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          line: 4,
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.afterAll(() => {});
        test.afterAll(() => {});
        test.afterEach(() => {});
      `,
      errors: [
        {
          column: 1,
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          line: 3,
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.describe('my test', () => {
          test.afterAll(() => {});
          test.afterEach(() => {});
        });
      `,
      errors: [
        {
          column: 3,
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          line: 3,
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.describe('my test', () => {
          test.afterAll(() => {});
          test.afterEach(() => {});

          doSomething();

          test.beforeEach(() => {});
          test.beforeAll(() => {});
        });
      `,
      errors: [
        {
          column: 3,
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          line: 3,
          messageId: 'reorderHooks',
        },
        {
          column: 3,
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          line: 8,
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.describe('my test', () => {
          test.afterAll(() => {});
          test.afterEach(() => {});

          test('is a test', () => {});

          test.beforeEach(() => {});
          test.beforeAll(() => {});
        });
      `,
      errors: [
        {
          column: 3,
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          line: 3,
          messageId: 'reorderHooks',
        },
        {
          column: 3,
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          line: 8,
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.describe('my test', () => {
          test.afterAll(() => {});

          test.describe('when something is true', () => {
            test.beforeEach(() => {});
            test.beforeAll(() => {});
          });
        });
      `,
      errors: [
        {
          column: 5,
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          line: 6,
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.describe('my test', () => {
          test.beforeAll(() => {});
          test.afterAll(() => {});
          test.beforeAll(() => {});

          test.describe('when something is true', () => {
            test.beforeAll(() => {});
            test.afterEach(() => {});
            test.beforeEach(() => {});
            test.afterEach(() => {});
          });
        });
      `,
      errors: [
        {
          column: 3,
          data: { currentHook: 'beforeAll', previousHook: 'afterAll' },
          line: 4,
          messageId: 'reorderHooks',
        },
        {
          column: 5,
          data: { currentHook: 'beforeEach', previousHook: 'afterEach' },
          line: 9,
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.describe('my test', () => {
          test.beforeAll(() => {});
          test.beforeAll(() => {});
          test.afterAll(() => {});

          test('foo nested', () => {
            // this is a test
          });

          test.describe('when something is true', () => {
            test.beforeAll(() => {});
            test.afterEach(() => {});

            test('foo nested', () => {
              // this is a test
            });

            test.describe('deeply nested', () => {
              test.afterAll(() => {});
              test.afterAll(() => {});
              // This comment does nothing
              test.afterEach(() => {});

              test('foo nested', () => {
                // this is a test
              });
            })
            test.beforeEach(() => {});
            test.afterEach(() => {});
          });
        });
      `,
      errors: [
        {
          column: 7,
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          line: 22,
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.describe('my test', () => {
          const setupDatabase = () => {
            test.beforeEach(() => {
              initDatabase();
              fillWithData();
            });
            test.beforeAll(() => {
              setupMocks();
            });
          };

          test('foo', () => {
            // this is a test
          });

          test.describe('my nested test', () => {
            test.afterAll(() => {});
            test.afterEach(() => {});

            test('foo nested', () => {
              // this is a test
            });
          });
        });
      `,
      errors: [
        {
          column: 5,
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          line: 7,
          messageId: 'reorderHooks',
        },
        {
          column: 5,
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          line: 18,
          messageId: 'reorderHooks',
        },
      ],
    },
    {
      code: dedent`
        test.describe('foo', () => {
          test.beforeEach(() => {
            seedMyDatabase();
          });

          test.beforeAll(() => {
            createMyDatabase();
          });

          test('accepts this input', () => {
            // ...
          });

          test('returns that value', () => {
            // ...
          });

          test.describe('when the database has specific values', () => {
            const specificValue = '...';

            test.beforeEach(() => {
              seedMyDatabase(specificValue);
            });

            test('accepts that input', () => {
              // ...
            });

            test('throws an error', () => {
              // ...
            });

            test.afterEach(() => {
              clearLogger();
            });

            test.beforeEach(() => {
              mockLogger();
            });

            test('logs a message', () => {
              // ...
            });
          });

          test.afterAll(() => {
            removeMyDatabase();
          });
        });
      `,
      errors: [
        {
          column: 3,
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          line: 6,
          messageId: 'reorderHooks',
        },
        {
          column: 5,
          data: { currentHook: 'beforeEach', previousHook: 'afterEach' },
          line: 37,
          messageId: 'reorderHooks',
        },
      ],
    },
    // Global aliases
    {
      code: dedent`
        const withDatabase = () => {
          it.afterAll(() => {
            removeMyDatabase();
          });
          it.beforeAll(() => {
            createMyDatabase();
          });
        };
      `,
      errors: [
        {
          column: 3,
          data: { currentHook: 'beforeAll', previousHook: 'afterAll' },
          line: 5,
          messageId: 'reorderHooks',
        },
      ],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    // Custom messages
    // Note: This is one of the only test in the project to tests custom
    // messages since it's implementation is global in the `createRule` method.
    {
      code: dedent`
        const withDatabase = () => {
          test.afterAll(() => {
            removeMyDatabase();
          });
          test.beforeAll(() => {
            createMyDatabase();
          });
        };
      `,
      errors: [{ column: 3, line: 5, message: 'afterAll should be after beforeAll' }],
      name: 'Custom messages',
      settings: {
        playwright: {
          messages: {
            reorderHooks: '{{ previousHook }} should be after {{currentHook}}',
          },
        },
      },
    },
  ],
  valid: [
    'test.beforeAll(() => {})',
    'test.beforeEach(() => {})',
    'test.afterEach(() => {})',
    'test.afterAll(() => {})',
    'test.describe(() => {})',
    dedent`
      test.beforeAll(() => {});
      test.beforeEach(() => {});
      test.afterEach(() => {});
      test.afterAll(() => {});
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
    dedent`
      test.beforeAll(() => {});
      test.afterAll(() => {});
    `,
    dedent`
      test.beforeEach(() => {});
      test.afterEach(() => {});
    `,
    dedent`
      test.beforeAll(() => {});
      test.afterEach(() => {});
    `,
    dedent`
      test.beforeAll(() => {});
      test.beforeEach(() => {});
    `,
    dedent`
      test.afterEach(() => {});
      test.afterAll(() => {});
    `,
    dedent`
      test.beforeAll(() => {});
      test.beforeAll(() => {});
    `,
    dedent`
      test.describe('my test', () => {
        test.afterEach(() => {});
        test.afterAll(() => {});
      });
    `,
    dedent`
      test.describe('my test', () => {
        test.afterEach(() => {});
        test.afterAll(() => {});

        doSomething();

        test.beforeAll(() => {});
        test.beforeEach(() => {});
      });
    `,
    dedent`
      test.describe('my test', () => {
        test.afterEach(() => {});
        test.afterAll(() => {});

        test('is a test', () => {});

        test.beforeAll(() => {});
        test.beforeEach(() => {});
      });
    `,
    dedent`
      test.describe('my test', () => {
        test.afterAll(() => {});

        test.describe('when something is true', () => {
          test.beforeAll(() => {});
          test.beforeEach(() => {});
        });
      });
    `,
    dedent`
      test.describe('my test', () => {
        test.afterAll(() => {});

        test.describe('when something is true', () => {
          test.beforeAll(() => {});
          test.beforeEach(() => {});

          test('does something', () => {});

          test.beforeAll(() => {});
          test.beforeEach(() => {});
        });

        test.beforeAll(() => {});
        test.beforeEach(() => {});
      });

      test.describe('my test', () => {
        test.beforeAll(() => {});
        test.beforeEach(() => {});
        test.afterAll(() => {});

        test.describe('when something is true', () => {
          test('does something', () => {});

          test.beforeAll(() => {});
          test.beforeEach(() => {});
        });

        test.beforeAll(() => {});
        test.beforeEach(() => {});
      });
    `,
    dedent`
      const withDatabase = () => {
        test.beforeAll(() => {
          createMyDatabase();
        });
        test.afterAll(() => {
          removeMyDatabase();
        });
      };

      test.describe('my test', () => {
        withDatabase();

        test.afterAll(() => {});

        test.describe('when something is true', () => {
          test.beforeAll(() => {});
          test.beforeEach(() => {});

          test('does something', () => {});

          test.beforeAll(() => {});
          test.beforeEach(() => {});
        });

        test.beforeAll(() => {});
        test.beforeEach(() => {});
      });

      test.describe('my test', () => {
        test.beforeAll(() => {});
        test.beforeEach(() => {});
        test.afterAll(() => {});

        withDatabase();

        test.describe('when something is true', () => {
          test('does something', () => {});

          test.beforeAll(() => {});
          test.beforeEach(() => {});
        });

        test.beforeAll(() => {});
        test.beforeEach(() => {});
      });
    `,
    dedent`
      test.describe('A file with a lot of test', () => {
        test.beforeAll(() => {
          setupTheDatabase();
          createMocks();
        });

        test.beforeAll(() => {
          doEvenMore();
        });

        test.beforeEach(() => {
          cleanTheDatabase();
          resetSomeThings();
        });

        test.afterEach(() => {
          cleanTheDatabase();
          resetSomeThings();
        });

        test.afterAll(() => {
          closeTheDatabase();
          stop();
        });

        test('does something', () => {
          const thing = getThing();
          expect(thing).toBe('something');
        });

        test('throws', () => {
          // Do something that throws
        });

        test.describe('Also have tests in here', () => {
          test.afterAll(() => {});
          test('tests something', () => {});
          test('tests something else', () => {});
          test.beforeAll(()=>{});
        });
      });
    `,
    // Global aliases
    {
      code: 'it.beforeAll(() => {})',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
})

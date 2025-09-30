import {
  javascript,
  runRuleTester,
  runTSRuleTester,
  typescript,
} from '../utils/rule-tester.js'
import rule from './require-hook.js'

const messageId = 'useHook'

runRuleTester('require-hook', rule, {
  invalid: [
    {
      code: 'setup();',
      errors: [{ column: 1, line: 1, messageId }],
    },
    {
      code: javascript`
        test.describe('some tests', () => {
          setup();
        });
      `,
      errors: [{ column: 3, line: 2, messageId }],
    },
    {
      code: javascript`
        test.describe('some tests', { tag: '@slow' }, () => {
          setup();
        });
      `,
      errors: [{ column: 3, line: 2, messageId }],
    },
    {
      code: javascript`
        let { setup } = require('./test-utils');

        test.describe('some tests', () => {
          setup();
        });
      `,
      errors: [
        { column: 1, line: 1, messageId },
        { column: 3, line: 4, messageId },
      ],
    },
    {
      code: javascript`
        test.describe('some tests', () => {
          setup();

          test('is true', () => {
            expect(true).toBe(true);
          });

          test.describe('more tests', () => {
            setup();

            test('is false', () => {
              expect(true).toBe(false);
            });
          });
        });
      `,
      errors: [
        { column: 3, line: 2, messageId },
        { column: 5, line: 9, messageId },
      ],
    },
    {
      code: 'let value = 1',
      errors: [{ column: 1, line: 1, messageId }],
    },
    {
      code: javascript`
        import { database, isCity } from '../database';
        import { loadCities } from '../api';

        const initializeCityDatabase = () => {
          database.addCity('Vienna');
          database.addCity('San Juan');
          database.addCity('Wellington');
        };

        const clearCityDatabase = () => {
          database.clear();
        };

        initializeCityDatabase();

        test('that persists cities', () => {
          expect(database.cities.length).toHaveLength(3);
        });

        test('city database has Vienna', () => {
          expect(isCity('Vienna')).toBeTruthy();
        });

        test('city database has San Juan', () => {
          expect(isCity('San Juan')).toBeTruthy();
        });

        test.describe('when loading cities from the api', () => {
          clearCityDatabase();

          test('does not duplicate cities', async () => {
            await database.loadCities();
            expect(database.cities).toHaveLength(4);
          });
        });

        clearCityDatabase();
      `,
      errors: [
        { column: 1, line: 14, messageId },
        { column: 3, line: 29, messageId },
        { column: 1, line: 37, messageId },
      ],
    },
    {
      code: javascript`
        enableAutoDestroy(test.afterEach);

        test.describe('some tests', () => {
          test('is false', () => {
            expect(true).toBe(true);
          });
        });
      `,
      errors: [{ column: 1, line: 1, messageId }],
      options: [{ allowedFunctionCalls: ['someOtherName'] }],
    },
    // Global aliases
    {
      code: javascript`
        it.describe('some tests', () => {
          setup();
        });
      `,
      errors: [{ column: 3, line: 2, messageId }],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    'test.use({ locale: "en-US" })',
    'test("some test", async ({ page }) => { })',
    'test("some test", { tag: "@slow" }, async ({ page }) => { })',
    'test.only("some test", async ({ page }) => { })',
    'test.skip("some test", async ({ page }) => { })',
    'test.fixme("some test", async ({ page }) => { })',
    { code: 'test.describe()' },
    { code: 'test.describe("just a title")' },
    { code: 'test.describe("just a title", { tag: "@slow" })' },
    { code: 'test.describe.configure({ mode: "parallel" })' },
    {
      code: javascript`
        test.describe.configure({ mode: 'parallel' });

        test.describe('A, runs in parallel with B', () => {
          test.describe.configure({ mode: 'default' });
          test('in order A1', async ({ page }) => {});
          test('in order A2', async ({ page }) => {});
        });
      `,
    },
    {
      code: javascript`
        test.describe.configure({ mode: 'parallel' });

        test.describe('A, runs in parallel with B', { tag: "@slow" }, () => {
          test.describe.configure({ mode: 'default' });
          test('in order A1', async ({ page }) => {});
          test('in order A2', { tag: "@slow" }, async ({ page }) => {});
        });
      `,
    },
    javascript`
      test.describe('a test', () =>
        test('something', () => {
          expect(true).toBe(true);
        }));
    `,
    javascript`
      test('it', () => {
        //
      });
    `,
    javascript`
      const { myFn } = require('../functions');

      test('myFn', () => {
        expect(myFn()).toBe(1);
      });
    `,
    {
      code: javascript`
        import { myFn } from '../functions';

        test('myFn', () => {
          expect(myFn()).toBe(1);
        });
      `,
    },
    javascript`
      class MockLogger {
        log() {}
      }

      test('myFn', () => {
        expect(myFn()).toBe(1);
      });
    `,
    javascript`
      const { myFn } = require('../functions');

      test.describe('myFn', () => {
        test('returns one', () => {
          expect(myFn()).toBe(1);
        });
      });
    `,
    javascript`
      test.describe('some tests', () => {
        test('is true', () => {
          expect(true).toBe(true);
        });
      });
    `,
    javascript`
      test.describe('some tests', () => {
        test('is true', () => {
          expect(true).toBe(true);
        });

        test.describe('more tests', () => {
          test('is false', () => {
            expect(true).toBe(false);
          });
        });
      });
    `,
    javascript`
      test.describe('some tests', () => {
        test.beforeEach(() => {
          setup();
        });
      });
    `,
    javascript`
      test.beforeEach(() => {
        initializeCityDatabase();
      });

      test.afterEach(() => {
        clearCityDatabase();
      });

      test('city database has Vienna', () => {
        expect(isCity('Vienna')).toBeTruthy();
      });

      test('city database has San Juan', () => {
        expect(isCity('San Juan')).toBeTruthy();
      });
    `,
    javascript`
      test.describe('cities', () => {
        test.beforeEach(() => {
          initializeCityDatabase();
        });

        test('city database has Vienna', () => {
          expect(isCity('Vienna')).toBeTruthy();
        });

        test('city database has San Juan', () => {
          expect(isCity('San Juan')).toBeTruthy();
        });

        test.afterEach(() => {
          clearCityDatabase();
        });
      });
    `,
    {
      code: javascript`
        enableAutoDestroy(test.afterEach);

        test.describe('some tests', () => {
          test('is false', () => {
            expect(true).toBe(true);
          });
        });
      `,
      options: [{ allowedFunctionCalls: ['enableAutoDestroy'] }],
    },
    // Global aliases
    {
      code: javascript`
        it.beforeEach(() => {
          initializeCityDatabase();
        });

        it.afterEach(() => {
          clearCityDatabase();
        });

        it('city database has Vienna', () => {
          expect(isCity('Vienna')).toBeTruthy();
        });

        it('city database has San Juan', () => {
          expect(isCity('San Juan')).toBeTruthy();
        });
      `,
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
})

runTSRuleTester('require-hook - TypeScript', rule, {
  invalid: [
    {
      code: typescript`
        import { setup } from '../test-utils';

        // todo: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/56545
        declare module 'eslint' {
          namespace ESLint {
            interface LintResult {
              fatalErrorCount: number;
            }
          }
        }

        test.describe('some tests', () => {
          setup();
        });
      `,
      errors: [{ column: 3, line: 13, messageId }],
    },
  ],
  valid: [
    typescript`
      import { myFn } from '../functions';

      // todo: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/56545
      declare module 'eslint' {
        namespace ESLint {
          interface LintResult {
            fatalErrorCount: number;
          }
        }
      }

      test('myFn', () => {
        expect(myFn()).toBe(1);
      });
    `,
  ],
})

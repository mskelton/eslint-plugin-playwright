import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-conditional-expect.js'

const messageId = 'conditionalExpect'

runRuleTester('common tests', rule, {
  invalid: [],
  valid: [
    dedent`
      test('foo', () => {
        expect(1).toBe(2);
      });
    `,
    dedent`
      test('foo', () => {
        expect(!true).toBe(false);
      });
    `,
    {
      code: dedent`
        test('foo', () => {
          const expected = arr.map((x) => {
            if (typeof x === 'string') {
              return expect.arrayContaining([x])
            } else {
              return b
            }
          })

          expect([1, 2, 3]).toEqual(expected);
        });
      `,
    },
  ],
})

runRuleTester('logical conditions', rule, {
  invalid: [
    {
      code: `
        test('foo', () => {
          something && expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId }],
    },
    {
      code: `
        test('foo', async () => {
          await test.step('bar', async () => {
            something && expect(something).toHaveBeenCalled();
          })
        })
      `,
      errors: [{ messageId }],
    },
    {
      code: `
        test('foo', () => {
          a || b && expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId }],
    },
    {
      code: `
        test('foo', () => {
          (a || b) && expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId }],
    },
    {
      code: `
        test('foo', () => {
          a || (b && expect(something).toHaveBeenCalled());
        })
      `,
      errors: [{ messageId }],
    },
    {
      code: `
        test('foo', () => {
          a && b && expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId }],
    },
    {
      code: `
        test('foo', () => {
          a && b || expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId }],
    },
    {
      code: `
        test('foo', () => {
          (a && b) || expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId }],
    },
    {
      code: `
        test('foo', () => {
          something || expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId }],
    },
    // Global aliases
    {
      code: `
        it('foo', () => {
          something && expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId }],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    `
      test('foo', () => {
        process.env.FAIL && setNum(1);

        expect(num).toBe(2);
      });
    `,
    `
      function getValue() {
        let num = 2;

        process.env.FAIL && setNum(1);

        return num;
      }

      test('foo', () => {
        expect(getValue()).toBe(2);
      });
    `,
    `
      test('foo', () => {
        process.env.FAIL || setNum(1);

        expect(num).toBe(2);
      });
    `,
    `
      function getValue() {
        let num = 2;

        process.env.FAIL || setNum(1);

        return num;
      }

      test('foo', () => {
        expect(getValue()).toBe(2);
      });
    `,
    // Global aliases
    {
      code: dedent`
        it('foo', () => {
          process.env.FAIL && setNum(1);

          expect(num).toBe(2);
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

runRuleTester('conditional conditions', rule, {
  invalid: [
    {
      code: `
        test('foo', () => {
          something ? expect(something).toHaveBeenCalled() : noop();
        })
      `,
      errors: [{ messageId }],
    },
    {
      code: `
        test('foo', () => {
          something ? noop() : expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId }],
    },
  ],
  valid: [
    `
      test('foo', () => {
        const num = process.env.FAIL ? 1 : 2;

        expect(num).toBe(2);
      });
    `,
    `
      function getValue() {
        return process.env.FAIL ? 1 : 2
      }

      test('foo', () => {
        expect(getValue()).toBe(2);
      });
    `,
  ],
})

runRuleTester('switch conditions', rule, {
  invalid: [
    {
      code: `
        test('foo', () => {
          switch(something) {
            case 'value':
              break;
            default:
              expect(something).toHaveBeenCalled();
          }
        })
      `,
      errors: [{ messageId }],
    },
    {
      code: `
        test('foo', () => {
          switch(something) {
            case 'value':
              expect(something).toHaveBeenCalled();
            default:
              break;
          }
        })
      `,
      errors: [{ messageId }],
    },
  ],
  valid: [
    `
      test('foo', () => {
        let num;

        switch(process.env.FAIL) {
          case true:
            num = 1;
            break;
          case false:
            num = 2;
            break;
        }

        expect(num).toBe(2);
      });
    `,
    `
      function getValue() {
        switch(process.env.FAIL) {
          case true:
            return 1;
          case false:
            return 2;
        }
      }

      test('foo', () => {
        expect(getValue()).toBe(2);
      });
    `,
  ],
})

runRuleTester('if conditions', rule, {
  invalid: [
    {
      code: `
        test('foo', () => {
          if(doSomething) {
            expect(something).toHaveBeenCalled();
          }
        })
      `,
      errors: [{ messageId }],
    },
    {
      code: `
        test('foo', () => {
          if(!doSomething) {
            // do nothing
          } else {
            expect(something).toHaveBeenCalled();
          }
        })
      `,
      errors: [{ messageId }],
    },
  ],
  valid: [
    `
      test('foo', () => {
        let num = 2;

        if(process.env.FAIL) {
          num = 1;
        }

        expect(num).toBe(2);
      });
    `,
    `
      function getValue() {
        if(process.env.FAIL) {
          return 1;
        }

        return 2;
      }

      test('foo', () => {
        expect(getValue()).toBe(2);
      });
    `,
  ],
})

runRuleTester('catch conditions', rule, {
  invalid: [
    {
      code: `
        test('foo', () => {
          try {
          } catch (err) {
            expect(err).toMatch('Error');
          }
        })
      `,
      errors: [{ messageId }],
    },
  ],
  valid: [
    `
      test('foo', () => {
        try {
          // do something
        } catch {
          // ignore errors
        } finally {
          expect(something).toHaveBeenCalled();
        }
      });
    `,
    `
      test('foo', () => {
        try {
          // do something
        } catch {
          // ignore errors
        }

        expect(something).toHaveBeenCalled();
      });
    `,
    `
      function getValue() {
        try {
          // do something
        } catch {
          // ignore errors
        } finally {
          expect(something).toHaveBeenCalled();
        }
      }

      test('foo', getValue);
    `,
    `
      function getValue() {
        try {
          process.env.FAIL.toString();

          return 1;
        } catch {
          return 2;
        }
      }

      test('foo', () => {
        expect(getValue()).toBe(2);
      });
    `,
  ],
})

runRuleTester('promises', rule, {
  invalid: [
    {
      code: dedent`
        test('works', async () => {
          await Promise.resolve()
            .then(() => { throw new Error('oh noes!'); })
            .catch(error => expect(error).toBeInstanceOf(Error));
        });
      `,
      errors: [{ messageId }],
    },
    {
      code: dedent`
        test('works', async () => {
          await Promise.resolve()
            .then(() => { throw new Error('oh noes!'); })
            .catch(error => expect(error).toBeInstanceOf(Error))
            .then(() => { throw new Error('oh noes!'); })
            .catch(error => expect(error).toBeInstanceOf(Error))
            .then(() => { throw new Error('oh noes!'); })
            .catch(error => expect(error).toBeInstanceOf(Error));
        });
      `,
      errors: [{ messageId }],
    },
    {
      code: dedent`
        test('works', async () => {
          await Promise.resolve()
            .catch(error => expect(error).toBeInstanceOf(Error))
            .catch(error => expect(error).toBeInstanceOf(Error))
            .catch(error => expect(error).toBeInstanceOf(Error));
        });
      `,
      errors: [{ messageId }],
    },
    {
      code: dedent`
        test('works', async () => {
          await Promise.resolve()
            .catch(error => expect(error).toBeInstanceOf(Error))
            .then(() => { throw new Error('oh noes!'); })
            .then(() => { throw new Error('oh noes!'); })
            .then(() => { throw new Error('oh noes!'); });
        });
      `,
      errors: [{ messageId }],
    },
    {
      code: dedent`
        test('works', async () => {
          await somePromise
            .then(() => { throw new Error('oh noes!'); })
            .catch(error => expect(error).toBeInstanceOf(Error));
        });
      `,
      errors: [{ messageId }],
    },
    {
      code: dedent`
        test('works', async () => {
          await somePromise.catch(error => expect(error).toBeInstanceOf(Error));
        });
      `,
      errors: [{ messageId }],
    },
  ],
  valid: [
    `
      test('works', async () => {
        try {
          await Promise.resolve().then(() => {
            throw new Error('oh noes!');
          });
        } catch {
          // ignore errors
        } finally {
          expect(something).toHaveBeenCalled();
        }
      });
    `,
    `
      test('works', async () => {
        await doSomething().catch(error => error);

        expect(error).toBeInstanceOf(Error);
      });
    `,
    `
      test('works', async () => {
        try {
          await Promise.resolve().then(() => {
            throw new Error('oh noes!');
          });
        } catch {
          // ignore errors
        }

        expect(something).toHaveBeenCalled();
      });
    `,
  ],
})

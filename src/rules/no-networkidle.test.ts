import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-networkidle.js'

const messageId = 'noNetworkidle'

runRuleTester('no-networkidle', rule, {
  invalid: [
    {
      code: 'page.waitForLoadState("networkidle")',
      errors: [{ column: 23, endColumn: 36, line: 1, messageId }],
    },
    {
      code: 'page.waitForURL(url, { waitUntil: "networkidle" })',
      errors: [{ column: 35, endColumn: 48, line: 1, messageId }],
    },
    {
      code: 'page["waitForURL"](url, { waitUntil: "networkidle" })',
      errors: [{ column: 38, endColumn: 51, line: 1, messageId }],
    },
    {
      code: 'page[`waitForURL`](url, { waitUntil: "networkidle" })',
      errors: [{ column: 38, endColumn: 51, line: 1, messageId }],
    },
    {
      code: 'page.goto(url, { waitUntil: "networkidle" })',
      errors: [{ column: 29, endColumn: 42, line: 1, messageId }],
    },
    {
      code: 'page.reload(url, { waitUntil: "networkidle" })',
      errors: [{ column: 31, endColumn: 44, line: 1, messageId }],
    },
    {
      code: 'page.setContent(url, { waitUntil: "networkidle" })',
      errors: [{ column: 35, endColumn: 48, line: 1, messageId }],
    },
    {
      code: 'page.goBack(url, { waitUntil: "networkidle" })',
      errors: [{ column: 31, endColumn: 44, line: 1, messageId }],
    },
    {
      code: 'page.goForward(url, { waitUntil: "networkidle" })',
      errors: [{ column: 34, endColumn: 47, line: 1, messageId }],
    },
    {
      code: 'page.waitForLoadState(`networkidle`)',
      errors: [{ column: 23, endColumn: 36, line: 1, messageId }],
      name: 'Template literal in waitForLoadState',
    },
    {
      code: 'page.goto(url, { waitUntil: `networkidle` })',
      errors: [{ column: 29, endColumn: 42, line: 1, messageId }],
      name: 'Template literal in goto options',
    },
  ],
  valid: [
    'foo("networkidle")',
    'foo(url, { waitUntil: "networkidle" })',
    'foo.bar("networkidle")',
    'foo.bar(url, { waitUntil: "networkidle" })',
    'page.hi("networkidle")',
    'page.hi(url, { waitUntil: "networkidle" })',
    'frame.hi("networkidle")',
    'frame.hi(url, { waitUntil: "networkidle" })',

    // Other options are valid

    'this.page.waitForLoadState()',
    'page.waitForLoadState({ waitUntil: "load" })',
    'page.waitForURL(url, { waitUntil: "load" })',
  ],
})

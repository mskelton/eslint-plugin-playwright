# ESLint Plugin Playwright - Agent Guidelines

## Project Overview

This is a comprehensive ESLint plugin for Playwright testing that provides 50+
rules to enforce best practices and catch common issues in Playwright test code.
The plugin is built with TypeScript, uses modern ESLint APIs, and follows strict
testing practices.

## Architecture & Code Structure

### Core Architecture

- **Entry Point**: `src/index.ts` - Exports all rules and configurations
- **Rule Structure**: Each rule follows the pattern `src/rules/{rule-name}.ts`
  with corresponding tests
- **Utilities**: Shared utilities in `src/utils/` for AST manipulation, parsing,
  and common patterns
- **Configurations**: Supports both flat config (ESLint 9+) and legacy config
  formats

### Key Patterns & Conventions

#### Rule Implementation Pattern

```typescript
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'
// ... other imports

export default createRule({
  create(context) {
    // Rule logic here
    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'expect') return
        // Rule-specific logic
      }
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Rule description',
      recommended: true,
      url: 'https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/{rule-name}.md',
    },
    messages: {
      messageId: 'Message text with {{ interpolation }}',
    },
    schema: [/* JSON schema for options */],
    type: 'problem' | 'suggestion',
    fixable?: 'code' | 'whitespace',
  },
})
```

#### AST Utilities & Patterns

- **`parseFnCall`**: Core utility for parsing Playwright function calls (test,
  expect, describe, etc.)
- **`createRule`**: Wrapper that handles custom message interpolation and
  context modification
- **AST Helpers**: `getStringValue`, `isIdentifier`, `findParent`, `dereference`
  for node manipulation
- **Type Safety**: Extensive TypeScript types for AST nodes with parent
  extensions

#### Testing Pattern

```typescript
import rule from './{rule-name}.js'
import { javascript, runRuleTester } from '../utils/rule-tester.js'

runRuleTester('{rule-name}', rule, {
  invalid: [
    {
      code: 'test("should fail", () => {});',
      errors: [{ messageId: 'errorMessage', type: 'Identifier' }],
    },
  ],
  valid: ['test("should pass", () => expect(true).toBe(true))'],
})
```

## Development Workflow

### Test-Driven Development (TDD)

1. **Always write tests first** - Every rule must have comprehensive test
   coverage
2. **Test both valid and invalid cases** - Include edge cases and complex
   scenarios
3. **Use the `runRuleTester` utility** - Provides consistent testing framework
4. **Test with different configurations** - Options, settings, global aliases
5. **Test with TypeScript** - Use `runTSRuleTester` for TypeScript-specific
   rules

### Rule Development Process

1. **Analyze the problem** - Understand what Playwright pattern needs
   enforcement
2. **Write failing tests** - Define what should and shouldn't trigger the rule
3. **Implement the rule** - Use existing utilities and patterns
4. **Add documentation** - Create markdown file in `docs/rules/`
5. **Update README** - Add rule to the rules table
6. **Register the rule** - Add to `src/index.ts` exports and configurations

### Code Quality Standards

- **TypeScript strict mode** - All code must be properly typed
- **ESLint compliance** - Code must pass the project's own linting rules
- **Prettier formatting** - Consistent code formatting
- **Comprehensive testing** - Aim for 100% test coverage on new rules

## Key Utilities & APIs

### AST Manipulation (`src/utils/ast.ts`)

- `getStringValue(node)` - Extract string value from various node types
- `isIdentifier(node, name?)` - Check if node is identifier with optional name
- `findParent(node, type)` - Find parent node of specific type
- `dereference(context, node)` - Resolve variable references
- `isPageMethod(node, name)` - Check if call is page method

### Function Call Parsing (`src/utils/parseFnCall.ts`)

- `parseFnCall(context, node)` - Parse Playwright function calls
- `isTypeOfFnCall(context, node, types)` - Check function call types
- Supports: `test`, `expect`, `describe`, `hook`, `step`, `config`

### Rule Creation (`src/utils/createRule.ts`)

- Handles custom message interpolation via `{{ variable }}` syntax
- Supports global settings for message customization
- Provides consistent rule context wrapper

### Fixing Utilities (`src/utils/fixer.ts`)

- `replaceAccessorFixer` - Replace property accessors safely
- `removePropertyFixer` - Remove object properties with cleanup

## Configuration & Settings

### Plugin Settings

```json
{
  "settings": {
    "playwright": {
      "globalAliases": {
        "test": ["it", "spec"],
        "expect": ["assert"]
      },
      "messages": {
        "customMessageId": "Custom error message"
      }
    }
  }
}
```

### Rule Options

- Most rules support configuration options via JSON schema
- Options are validated at runtime
- Default values should be sensible and well-documented

## Testing Strategies

### Test Structure

- **Invalid cases**: Code that should trigger the rule
- **Valid cases**: Code that should not trigger the rule
- **Edge cases**: Complex scenarios, nested structures, different syntax
- **Configuration tests**: Different options and settings

### Test Utilities

- `javascript` template literal for multi-line code
- `typescript` template literal for TypeScript code
- `test()` wrapper for common test patterns
- Global alias testing with settings

### Test Coverage Requirements

- All rule logic paths must be tested
- All message variations must be tested
- All configuration options must be tested
- Edge cases and error conditions must be tested

## Documentation Standards

### Rule Documentation (`docs/rules/`)

- Clear description of what the rule does
- Examples of correct and incorrect usage
- Configuration options with examples
- Rationale for the rule's existence

### README Integration

- Rules table with status indicators (✅ recommended, 🔧 fixable, 💡
  suggestions)
- Clear categorization and descriptions
- Links to detailed documentation

## Issue Resolution Process

### GitHub Issue Workflow

1. **Get issue details**:
   `gh issue view <issue-number> --json 'title,body,comments'`
2. **Analyze the problem**: Understand the specific Playwright pattern or issue
3. **Create a plan**: Step-by-step approach to solving the issue
4. **Write tests first**: Implement failing tests that demonstrate the problem
5. **Implement the solution**: Write the rule or fix the bug
6. **Verify with tests**: Run `yarn test` to ensure all tests pass
7. **Create branch and PR**: Use semantic commit messages and add `ai` label

### Common Issue Types

- **New rule requests**: Implement new Playwright best practices
- **Bug fixes**: Existing rules not working correctly
- **Enhancement requests**: Additional options or functionality
- **Documentation updates**: Clarifying rule behavior or usage

## Build & Release Process

### Development Commands

- `yarn install` - Install dependencies
- `yarn test` - Run all tests
- `yarn test:watch` - Run tests in watch mode
- `yarn build` - Build the plugin
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier

### Release Process

- Uses semantic-release for automated versioning
- Triggered via GitHub Actions workflow
- Requires all tests to pass before release
- Automatically publishes to npm

## Best Practices for Agents

### When Implementing New Rules

1. **Study existing rules** - Understand patterns from similar rules
2. **Use existing utilities** - Don't reinvent AST parsing logic
3. **Follow naming conventions** - Rule names should be descriptive and
   consistent
4. **Consider edge cases** - Think about complex Playwright patterns
5. **Test thoroughly** - Include both obvious and subtle test cases

### When Fixing Bugs

1. **Reproduce the issue** - Create a minimal test case
2. **Understand the root cause** - Is it AST parsing, logic, or configuration?
3. **Fix the core issue** - Don't just patch symptoms
4. **Add regression tests** - Ensure the bug doesn't return

### When Adding Features

1. **Backward compatibility** - Don't break existing configurations
2. **Performance considerations** - Rules run on every file
3. **User experience** - Clear error messages and helpful suggestions
4. **Documentation** - Update docs and examples

### Code Review Checklist

- [ ] Tests cover all code paths
- [ ] Error messages are clear and helpful
- [ ] Configuration options are well-documented
- [ ] Performance impact is reasonable
- [ ] Backward compatibility is maintained
- [ ] Documentation is updated

## Common Patterns & Anti-patterns

### Good Patterns

- Use `parseFnCall` for function identification
- Use `createRule` wrapper for consistency
- Provide helpful error messages with context
- Include auto-fix capabilities when possible
- Test with both JavaScript and TypeScript

### Anti-patterns to Avoid

- Reinventing AST parsing logic
- Hard-coding string literals instead of using utilities
- Not testing edge cases and complex scenarios
- Ignoring performance implications
- Breaking backward compatibility without good reason

## Semantic Commit Messages

This project uses semantic-release, so commit messages must follow the format:

- `feat: add new rule or feature`
- `fix: fix bug in existing rule`
- `docs: update documentation`
- `refactor: refactor existing code`
- `test: add or update tests`
- `chore: maintenance tasks`
- `style: formatting changes`

## Pull Request Guidelines

- Add the `ai` label to all PRs
- Ensure all tests pass before submitting
- Include comprehensive test coverage
- Update documentation as needed
- Follow the existing code style and patterns
- Provide clear description of changes and rationale
  - `test: add tests`
  - `style: update styles`

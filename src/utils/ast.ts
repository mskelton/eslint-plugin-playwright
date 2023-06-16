import { Rule } from 'eslint';
import * as ESTree from 'estree';
import { NodeWithParent, TypedNodeWithParent } from './types';

export function getStringValue(node: ESTree.Node | undefined) {
  if (!node) return '';

  return node.type === 'Identifier'
    ? node.name
    : node.type === 'TemplateLiteral'
    ? node.quasis[0].value.raw
    : node.type === 'Literal' && typeof node.value === 'string'
    ? node.value
    : '';
}

export function getRawValue(node: ESTree.Node) {
  return node.type === 'Literal' ? node.raw : undefined;
}

export function isIdentifier(node: ESTree.Node, name: string) {
  return node.type === 'Identifier' && node.name === name;
}

function isLiteral<T>(node: ESTree.Node, type: string, value?: T) {
  return (
    node.type === 'Literal' &&
    (value === undefined
      ? typeof node.value === type
      : (node.value as any) === value)
  );
}

export function isStringLiteral(node: ESTree.Node, value?: string) {
  return isLiteral(node, 'string', value);
}

export function isBooleanLiteral(node: ESTree.Node, value?: boolean) {
  return isLiteral(node, 'boolean', value);
}

export function isPropertyAccessor(
  node: ESTree.MemberExpression,
  name: string
) {
  return getStringValue(node.property) === name;
}

export function isTestIdentifier(node: ESTree.Node) {
  return (
    isIdentifier(node, 'test') ||
    (node.type === 'MemberExpression' && isIdentifier(node.object, 'test'))
  );
}

const describeProperties = new Set([
  'parallel',
  'serial',
  'only',
  'skip',
  'fixme',
]);

export function isDescribeCall(node: ESTree.Node): boolean {
  const inner = node.type === 'CallExpression' ? node.callee : node;

  // Allow describe without test prefix
  if (isIdentifier(inner, 'describe')) {
    return true;
  }

  if (inner.type !== 'MemberExpression') {
    return false;
  }

  return isPropertyAccessor(inner, 'describe')
    ? true
    : describeProperties.has(getStringValue(inner.property))
    ? isDescribeCall(inner.object)
    : false;
}

export function findParent<T extends ESTree.Node['type']>(
  node: NodeWithParent,
  type: T
): TypedNodeWithParent<T> | undefined {
  if (!node.parent) return;

  return node.parent.type === type
    ? (node.parent as unknown as TypedNodeWithParent<T>)
    : findParent(node.parent, type);
}

export function isTest(node: ESTree.CallExpression) {
  return (
    isTestIdentifier(node.callee) &&
    !isDescribeCall(node) &&
    node.arguments.length === 2 &&
    ['ArrowFunctionExpression', 'FunctionExpression'].includes(
      node.arguments[1].type
    )
  );
}

const testHooks = new Set(['afterAll', 'afterEach', 'beforeAll', 'beforeEach']);
export function isTestHook(node: ESTree.CallExpression) {
  return (
    node.callee.type === 'MemberExpression' &&
    isIdentifier(node.callee.object, 'test') &&
    testHooks.has(getStringValue(node.callee.property))
  );
}

const expectSubCommands = new Set(['soft', 'poll']);
export type ExpectType = 'standalone' | 'soft' | 'poll';

export function getExpectType(
  node: ESTree.CallExpression
): ExpectType | undefined {
  if (isIdentifier(node.callee, 'expect')) {
    return 'standalone';
  }

  if (
    node.callee.type === 'MemberExpression' &&
    isIdentifier(node.callee.object, 'expect')
  ) {
    const type = getStringValue(node.callee.property);
    return expectSubCommands.has(type) ? (type as ExpectType) : undefined;
  }
}

export function isExpectCall(node: ESTree.CallExpression) {
  return !!getExpectType(node);
}

export function getMatchers(
  node: Rule.Node,
  chain: Rule.Node[] = []
): Rule.Node[] {
  if (node.parent.type === 'MemberExpression' && node.parent.object === node) {
    return getMatchers(node.parent, [
      ...chain,
      node.parent.property as Rule.Node,
    ]);
  }

  return chain;
}

export function isPageMethod(node: ESTree.CallExpression, name: string) {
  return (
    node.callee.type === 'MemberExpression' &&
    (node.callee.object.type === 'MemberExpression'
      ? isIdentifier(node.callee.object.property, 'page')
      : isIdentifier(node.callee.object, 'page')) &&
    isPropertyAccessor(node.callee, name)
  );
}

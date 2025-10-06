import { TSESTree } from '@typescript-eslint/utils'
import ESTree from 'estree'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    const validateAnnotationObject = (
      annotationObj: TSESTree.ObjectExpression,
      reportNode: ESTree.Node,
    ) => {
      let hasType = false
      const validProperties = new Set(['type', 'description'])

      for (const prop of annotationObj.properties) {
        if (prop.type !== 'Property' || 'argument' in prop) {
          continue
        }

        if (prop.key.type !== 'Identifier') {
          continue
        }

        const propName = prop.key.name

        // Check for 'tag' property in annotation
        if (propName === 'tag') {
          context.report({
            messageId: 'tagInAnnotation',
            node: reportNode,
          })
          return
        }

        // Check for invalid properties
        if (!validProperties.has(propName)) {
          context.report({
            data: { property: propName },
            messageId: 'invalidAnnotationProperty',
            node: reportNode,
          })
          return
        }

        // Validate 'type' property
        if (propName === 'type') {
          hasType = true
          if (
            prop.value.type !== 'Literal' ||
            typeof prop.value.value !== 'string'
          ) {
            context.report({
              messageId: 'invalidTypeValue',
              node: reportNode,
            })
            return
          }
        }

        // Validate 'description' property
        if (propName === 'description') {
          if (
            prop.value.type !== 'Literal' ||
            typeof prop.value.value !== 'string'
          ) {
            context.report({
              messageId: 'invalidDescriptionValue',
              node: reportNode,
            })
            return
          }
        }
      }

      // Check if 'type' property is present
      if (!hasType) {
        context.report({
          messageId: 'missingType',
          node: reportNode,
        })
      }
    }

    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (!call) return

        const { type } = call
        if (type !== 'test' && type !== 'describe' && type !== 'step') return

        // Check if there's an options object as the second argument
        if (node.arguments.length < 2) return
        const optionsArg = node.arguments[1]
        if (!optionsArg || optionsArg.type !== 'ObjectExpression') return

        // Look for the annotation property in the options object
        const annotationProperty = optionsArg.properties.find(
          (prop) =>
            prop.type === 'Property' &&
            !('argument' in prop) &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'annotation',
        ) as TSESTree.Property | undefined

        if (!annotationProperty) return

        const annotationValue = annotationProperty.value

        // Annotation must be an object or array of objects
        if (annotationValue.type === 'ObjectExpression') {
          validateAnnotationObject(annotationValue, optionsArg)
        } else if (annotationValue.type === 'ArrayExpression') {
          // Validate each element in the array
          for (const element of annotationValue.elements) {
            if (!element) continue

            if (element.type !== 'ObjectExpression') {
              context.report({
                messageId: 'invalidAnnotationFormat',
                node: optionsArg,
              })
              return
            }

            validateAnnotationObject(element, optionsArg)
          }
        } else {
          // Invalid annotation format (string, number, etc.)
          context.report({
            messageId: 'invalidAnnotationFormat',
            node: optionsArg,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Enforce valid annotation format in Playwright test blocks',
      recommended: true,
      url: 'https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/valid-test-annotations.md',
    },
    messages: {
      invalidAnnotationFormat:
        'Annotation must be an object with "type" property or an array of such objects',
      invalidAnnotationProperty:
        'Invalid property "{{property}}" in annotation. Only "type" and "description" are allowed',
      invalidDescriptionValue: 'Annotation "description" must be a string',
      invalidTypeValue: 'Annotation "type" must be a string',
      missingType: 'Annotation must have a "type" property',
      tagInAnnotation:
        'Use "tag" property for tags, not inside "annotation". Tags should be defined separately',
    },
    schema: [],
    type: 'problem',
  },
})


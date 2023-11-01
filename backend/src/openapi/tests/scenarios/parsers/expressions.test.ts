import { describe, it } from "node:test";
import { TsExpressionParser } from "~/openapi/ts-parser/ts-functions/ts-expressions/parsers/ts-expression-parser";
import { TsParserBase } from "~/openapi/ts-parser/ts-readers";
import assert, { strictEqual } from "assert";
import { EExpressionOperatorTypes, ETsExpressionTypes } from "~/openapi/ts-parser/model";
import { TsExpressionComplex } from "~/openapi/ts-parser/ts-functions/ts-expressions/ts-expression-complex";
import { TsExpressionArray } from "~/openapi/ts-parser/ts-functions/ts-expressions/ts-expression-array";
import { TsExpressionObject } from "~/openapi/ts-parser/ts-functions/ts-expressions/ts-expression-object";
import { TsExpressionFunction } from "~/openapi/ts-parser/ts-functions/ts-expressions/ts-expression-function";
import { TsExpressionObjectAccess } from "~/openapi/ts-parser/ts-functions/ts-expressions/ts-expression-object-access";

const expressions = {
    stringExpression: '"Hello \\"World\\""',
    numberExpression: '123',
    arithmeticExpression: '1 + 2',
    groupExpression: '3 * (2 + 1)',
    mixedExpression: '1 + "Hello"',
    functionCallExpression: 'myFunction(1, "2") + 3',
    objectExpression: '{ a: 1, b: "2" }',
    arrayExpression: '[1, "2"]',
    nestedArrayExpression: '[1, "2", [3, "4"]]',
    methodCallExpression: 'myObject.myMethod(1, "2")',
    enumExpression: 'MyEnum.MyValue',
    newObjectExpression: 'new MyClass(1, "2")',
    arrowFunctionExpression: 'async (a: number, b: string) => a + b',
    arrowFunctionWithBodyExpression: 'async (a: number, b: string) => { return a + b; }',
    functionExpression: 'function(a: number, b: string) { return a + b; }',
}

class StringParser extends TsParserBase {
    constructor(value: string) {
        super(value);
    }
}

const getExpression = (expression: string) => TsExpressionParser.readExpression(new StringParser(expression));

describe('TsExpressionParser tests', () => {
    it('Test for base string', () => {
        const expression = getExpression(expressions.stringExpression);
        assert(expression);
        strictEqual(expression.expressionType, ETsExpressionTypes.String);
        strictEqual(expression.expressionValue, '"Hello \\"World\\""');
    });

    it('Test for base number', () => {
        const expression = getExpression(expressions.numberExpression);
        assert(expression);
        strictEqual(expression.expressionType, ETsExpressionTypes.Number);
        strictEqual(expression.expressionValue, 123);
    });

    it('Test for base arithmetic', () => {
        const expression = getExpression(expressions.arithmeticExpression);
        assert(expression);
        strictEqual(expression.expressionType, ETsExpressionTypes.Complex);
        const [firstOperand, secondOperand] = (expression as TsExpressionComplex).expressionValue;
        const [operator] = (expression as TsExpressionComplex).operators;
        assert(firstOperand);
        assert(secondOperand);
        strictEqual(firstOperand.expressionType, ETsExpressionTypes.Number);
        strictEqual(firstOperand.expressionValue, 1);
        strictEqual(secondOperand.expressionType, ETsExpressionTypes.Number);
        strictEqual(secondOperand.expressionValue, 2);
        strictEqual(operator.operatorType, EExpressionOperatorTypes.Sum);
    });

    it('Test for base group', () => {
        const expression = getExpression(expressions.groupExpression);
        assert(expression);
        strictEqual(expression.expressionType, ETsExpressionTypes.Complex);
        const [firstOperand, secondOperand] = (expression as TsExpressionComplex).expressionValue;
        const [operator] = (expression as TsExpressionComplex).operators;


        assert(firstOperand);
        assert(secondOperand);
        strictEqual(firstOperand.expressionType, ETsExpressionTypes.Number);
        strictEqual(firstOperand.expressionValue, 3);
        strictEqual(operator.operatorType, EExpressionOperatorTypes.Multiply);

        strictEqual(secondOperand.expressionType, ETsExpressionTypes.Complex);
        const [secondOperandFirstOperand, secondOperandSecondOperand] = (secondOperand as TsExpressionComplex).expressionValue;
        const [secondOperandOperator] = (secondOperand as TsExpressionComplex).operators;

        assert(secondOperandFirstOperand);
        assert(secondOperandSecondOperand);
        strictEqual(secondOperandFirstOperand.expressionType, ETsExpressionTypes.Number);
        strictEqual(secondOperandFirstOperand.expressionValue, 2);
        strictEqual(secondOperandSecondOperand.expressionType, ETsExpressionTypes.Number);
        strictEqual(secondOperandSecondOperand.expressionValue, 1);
        strictEqual(secondOperandOperator.operatorType, EExpressionOperatorTypes.Sum);
    });

    it('Test for base mixed', () => {
        const expression = getExpression(expressions.mixedExpression);
        assert(expression);

        strictEqual(expression.expressionType, ETsExpressionTypes.Complex);
        const [firstOperand, secondOperand] = (expression as TsExpressionComplex).expressionValue;
        const [operator] = (expression as TsExpressionComplex).operators;

        assert(firstOperand);
        assert(secondOperand);

        strictEqual(firstOperand.expressionType, ETsExpressionTypes.Number);
        strictEqual(firstOperand.expressionValue, 1);
        strictEqual(secondOperand.expressionType, ETsExpressionTypes.String);
        strictEqual(secondOperand.expressionValue, '"Hello"');
        strictEqual(operator.operatorType, EExpressionOperatorTypes.Sum);
    });

    it('Test for base function expression', () => {
        const expression = getExpression(expressions.functionCallExpression);
        assert(expression);
        strictEqual(expression.expressionType, ETsExpressionTypes.Complex);
        const [firstOperand, secondOperand] = (expression as TsExpressionComplex).expressionValue;
        const [operator] = (expression as TsExpressionComplex).operators;

        assert(firstOperand);
        assert(firstOperand instanceof TsExpressionFunction);
        assert(secondOperand);

        strictEqual(firstOperand.expressionType, ETsExpressionTypes.FunctionCall);
        strictEqual(firstOperand.functionName, 'myFunction');
        strictEqual(secondOperand.expressionType, ETsExpressionTypes.Number);
        strictEqual(secondOperand.expressionValue, 3);
        strictEqual(operator.operatorType, EExpressionOperatorTypes.Sum);
    });

    it('Test for base object', () => {
        const expression = getExpression(expressions.objectExpression);
        assert(expression);
        const objectExpression = expression as TsExpressionObject;
        strictEqual(objectExpression.expressionType, ETsExpressionTypes.Object);
        strictEqual(objectExpression.expressionValue.length, 2);
        const [firstField, secondField] = objectExpression.expressionValue;

        strictEqual(firstField.name, 'a');
        strictEqual(firstField.value.expressionType, ETsExpressionTypes.Number);
        strictEqual(firstField.value.expressionValue, 1);
        strictEqual(secondField.name, 'b');
        strictEqual(secondField.value.expressionType, ETsExpressionTypes.String);
        strictEqual(secondField.value.expressionValue, '"2"');
    });

    it('Test for base array', () => {
        const expression = getExpression(expressions.arrayExpression);
        assert(expression);
        strictEqual(expression.expressionType, ETsExpressionTypes.Array);
        const arrayExpression = expression as TsExpressionArray;
        strictEqual(arrayExpression.expressionType, ETsExpressionTypes.Array);
        strictEqual(arrayExpression.expressionValue.length, 2);

        const [firstItem, secondItem] = arrayExpression.expressionValue;
        strictEqual(firstItem.expressionType, ETsExpressionTypes.Number);
        strictEqual(firstItem.expressionValue, 1);
        strictEqual(secondItem.expressionType, ETsExpressionTypes.String);
        strictEqual(secondItem.expressionValue, '"2"');
    });

    it('Test for nested array', () => {
        const expression = getExpression(expressions.nestedArrayExpression);
        assert(expression);
        strictEqual(expression.expressionType, ETsExpressionTypes.Array);
        const arrayExpression = expression as TsExpressionArray;

        strictEqual(arrayExpression.expressionValue.length, 3);

        const [,, thirdItem] = arrayExpression.expressionValue;
        strictEqual(thirdItem.expressionType, ETsExpressionTypes.Array);
        const arrayThird = thirdItem as TsExpressionArray;
        strictEqual(arrayThird.expressionType, ETsExpressionTypes.Array);
        strictEqual(arrayThird.expressionValue.length, 2);

        strictEqual(arrayThird.expressionValue[0].expressionType, ETsExpressionTypes.Number);
        strictEqual(arrayThird.expressionValue[1].expressionType, ETsExpressionTypes.String);

        strictEqual(arrayThird.expressionValue[0].expressionValue, 3);
        strictEqual(arrayThird.expressionValue[1].expressionValue, '"4"');
    });

    it('Test for base methodCall', () => {
        const expression = getExpression(expressions.methodCallExpression);
        assert(expression);
        strictEqual(expression.expressionType, ETsExpressionTypes.ObjectAccess);
        const objectExpression = expression as TsExpressionObjectAccess;

        strictEqual(objectExpression.expressionValue, 'myObject');
        strictEqual(objectExpression.propertyName, 'myMethod');
        strictEqual(objectExpression.isMethod, true);
        strictEqual(objectExpression.argumentsList?.arguments.length, 2);
    });

    it('Test for base enum', () => {
        const expression = getExpression(expressions.enumExpression);
        assert(expression);

        strictEqual(expression.expressionType, ETsExpressionTypes.ObjectAccess);
        const objectExpression = expression as TsExpressionObjectAccess;

        strictEqual(objectExpression.expressionValue, 'MyEnum');
        strictEqual(objectExpression.propertyName, 'MyValue');
        strictEqual(objectExpression.isMethod, false);
    });

    it('Test for base newObject', () => {
        const expression = getExpression(expressions.newObjectExpression);
        assert(expression);
        strictEqual(expression.expressionType, ETsExpressionTypes.FunctionCall);
        const functionExpression = expression as TsExpressionFunction;

        strictEqual(functionExpression.functionName, 'MyClass');
        strictEqual(functionExpression.argumentsList.arguments.length, 2);
        strictEqual(functionExpression.isConstructor, true);
    });

    it('Test for base arrow function', () => {
        const expression = getExpression(expressions.arrowFunctionExpression);
        assert(expression);
    });

});
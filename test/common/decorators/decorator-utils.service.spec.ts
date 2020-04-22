import { Test, TestingModule } from '@nestjs/testing';
import { MetadataScanner } from '@nestjs/core';
import { expect } from 'chai';
import { Injectable, SetMetadata } from '@nestjs/common';
import { LoggedFunction } from '../../../src/common/decorators';
import { DecoratorUtilsService, MethodInfo } from '../../../src/common/decorators/decorator-utils.service';

describe('DecoratorUtils', () => {
    let decoratorUtilsService: DecoratorUtilsService;

    function TestMethodDecorator(key: string): MethodDecorator {
        return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            SetMetadata<String, MethodInfo>('TestDecorator', {
                key,
                target: target.constructor.name,
                methodName: propertyKey,
                callback: descriptor.value,
            })(target, propertyKey, descriptor);
        };
    }

    @Injectable()
    class TestWithMethod {
        @TestMethodDecorator('test')
        public test(): Promise<true> {
            return Promise.resolve(true);
        }
    }

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [],
            controllers: [],
            providers: [DecoratorUtilsService, MetadataScanner, TestWithMethod],
        }).compile();
        decoratorUtilsService = moduleRef.get<DecoratorUtilsService>(DecoratorUtilsService);
    });

    it('should have right metadata', async () => {
        const metadata = Reflect.getMetadata('TestDecorator', TestWithMethod.prototype['test']);
        expect(metadata.key).to.eq('test');
    });

    it('should give health check', async () => {
        const methods = decoratorUtilsService.findProviderMethodsWithMetadata('TestDecorator');
        expect(methods.length).to.eq(1);
    });
});

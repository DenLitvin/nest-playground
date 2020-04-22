import { Test } from '@nestjs/testing';
import { expect } from 'chai';
import { Injectable } from '@nestjs/common';
import { LoggedFunction } from '../../../src/common/decorators/logger.decorator';

describe('MethodLoggerDecorator', () => {
    @Injectable()
    class TestWithMethod {
        @LoggedFunction()
        public test(): Promise<boolean> {
            return Promise.resolve(true);
        }
    }
    let testService: TestWithMethod;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [],
            controllers: [],
            providers: [TestWithMethod],
        }).compile();
        testService = moduleRef.get<TestWithMethod>(TestWithMethod);
    });

    it('should not break decorated methods', async () => {
        const methodResponse = await testService.test();
        expect(methodResponse).to.equal(true);
    });
});

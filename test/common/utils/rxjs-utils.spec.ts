import * as sinon from 'sinon';
import { expect } from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chai from 'chai';
import {poll} from "../../../src/common/utils/rxjs-utils";

chai.use(sinonChai);

describe('Rx utils tests', () => {
    beforeEach(async () => {});

    afterEach(async () => {});

    it('poll number of attempts reached', async () => {
        const api = {
            method: () => {
                return Promise.resolve(true);
            },
        };
        // const stub = sinon.stub(api, 'method');
        // stub.returns(true);
        const methodSpy = sinon.spy(api, 'method');
        let resolveFunction: any;
        let rejectFunction: any;
        const returnPromise = new Promise((resolve, reject) => {
            resolveFunction = resolve;
            rejectFunction = reject;
        });
        poll<boolean>(
            api.method.bind(api),
            [],
            (param: boolean) => {
                return param;
            },
            1,
            3
        ).subscribe(
            (response: any) => {
                rejectFunction('should error with number of attempts');
            },
            (error: any) => {
                expect(error.message).to.eq('maxattempts');
                expect(methodSpy).to.have.been.calledThrice;
                resolveFunction();
            }
        );
        return returnPromise;
    });

    it('poll succesfull from first attempt', async () => {
        const api = {
            method: () => {
                return Promise.resolve(true);
            },
        };
        const methodSpy = sinon.spy(api, 'method');
        let resolveFunction: any;
        let rejectFunction: any;
        const returnPromise = new Promise((resolve, reject) => {
            resolveFunction = resolve;
            rejectFunction = reject;
        });
        poll<boolean>(
            api.method.bind(api),
            [],
            (param: boolean) => {
                return false;
            },
            10,
            1
        ).subscribe(
            (response: any) => {
                expect(methodSpy).to.have.been.calledOnce;
                resolveFunction();
            },
            (error: any) => {
                rejectFunction('should return value');
            }
        );
        return returnPromise;
    });

    it('poll succesfull from second attempt', async () => {
        const api = {
            method: () => {
                return Promise.resolve(true);
            },
        };
        const methodStub = sinon.stub(api, 'method');
        methodStub.onCall(0).returns(Promise.resolve(true));
        methodStub.onCall(1).returns(Promise.resolve(false));
        let resolveFunction: any;
        let rejectFunction: any;
        const returnPromise = new Promise((resolve, reject) => {
            resolveFunction = resolve;
            rejectFunction = reject;
        });
        poll<boolean>(
            api.method.bind(api),
            [],
            (param: boolean) => {
                return param;
            },
            10,
            2
        ).subscribe(
            (response: any) => {
                expect(methodStub).to.have.been.calledTwice;
                resolveFunction();
            },
            (error: any) => {
                rejectFunction('should return value');
            }
        );
        return returnPromise;
    });
});

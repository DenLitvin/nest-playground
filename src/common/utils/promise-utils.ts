export interface Deferred<T, E = Error> {
    resolve(value: T): void;
    reject(error: T | E): void;
    value: Promise<T>;
}

export const createDeferred = <T = void, E = Error>(): Deferred<T, E> => {
    let resolve: (value: T) => void;
    let reject: (error: E) => void;
    const value = new Promise<T>((pResolve, pReject) => {
        resolve = (t: T) => {
            pResolve(t);
        };
        reject = (e: E) => {
            pReject(e);
        };
    });
    return { resolve: resolve!, reject: reject!, value };
};
import { scan, tap, switchMap, skipWhile, startWith } from 'rxjs/operators';
import { from, interval } from 'rxjs';

export function catchingNext<T>(nextFunction: (value: T) => void, errorHandler: (err: any, value?: T) => void) {
    return (incomingValue: T) => {
        try {
            nextFunction(incomingValue);
        } catch (err) {
            errorHandler(err, incomingValue);
        }
    };
}

const POLLING_INTERVAL = 10000; // in milliseconds
const MAX_ATTEMPTS = 60;

export function poll<T>(
    fetchFn: any,
    params: string[],
    repeatPredicate: (res: T) => boolean,
    pollInterval = POLLING_INTERVAL,
    maxAttempts = MAX_ATTEMPTS
) {
    return interval(pollInterval).pipe(
        startWith(0),
        scan(attempts => ++attempts, 0),
        tap(checkAttempts(maxAttempts)),
        switchMap(() => from(fetchFn(...params))),
        skipWhile(response => repeatPredicate(response as T))
    );
}

export function checkAttempts(maxAttempts: number) {
    return (attempts: number) => {
        if (attempts > maxAttempts) {
            throw new Error('maxattempts');
        }
    };
}

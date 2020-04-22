import { Logger } from '@nestjs/common';

export function LoggedFunction(): MethodDecorator {
    return (target: object, methodName: string, descriptor: PropertyDescriptor) => {
        const className = target.constructor.name;
        const original = descriptor.value;

        descriptor.value = new Proxy(original, {
            apply: function(target, thisArg, args) {
                Logger.log(`Call with args: ${JSON.stringify(args)}`, `${className}#${methodName}`);
                const result = target.apply(thisArg, args);
                Logger.log(`Return: ${JSON.stringify(result)}`, `${className}#${methodName}`);
                return result;
            },
        });
    };
}

import { Injectable, Provider } from '@nestjs/common';
import { ModulesContainer, MetadataScanner } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';

@Injectable()
export class DecoratorUtilsService {
    constructor(private readonly modulesContainer: ModulesContainer, private readonly metadataScanner: MetadataScanner) {}

    public exploreMethodMetadata(
        instance: object,
        instancePrototype: Provider,
        methodName: string,
        decoratorName: string
    ): any | null {
        // Finds metadata handler
        const targetCallback = instancePrototype[methodName];
        const handler = Reflect.getMetadata(decoratorName, targetCallback);
        if (handler == null) {
            return null;
        }
        return handler;
    }

    public findProviderMethodsWithMetadata(metadataParameter: string): MethodInfo[] {
        // Scanning providers for methods with specific decorator metadata
        // find all the providers
        const modules: Array<Module> = [...this.modulesContainer.values()];
        const providersMapArray: Array<Map<any, InstanceWrapper>> = modules
            .filter(({ providers }) => providers.size > 0)
            .map(({ providers }) => providers);

        // munge the instance wrappers into a nice format
        const instanceWrappers: InstanceWrapper<Provider>[] = [];
        providersMapArray.forEach(map => {
            const mapKeys = [...map.keys()];
            instanceWrappers.push(
                ...mapKeys.map(key => {
                    return map.get(key);
                })
            );
        });

        // find the handlers marked with decorator
        return instanceWrappers
            .filter((wrapper: InstanceWrapper<Provider>) => {
                return wrapper.instance != null && wrapper.instance !== undefined;
            })
            .map((wrapper: InstanceWrapper<Provider>) => {
                const provider: Provider = wrapper.instance;
                const instancePrototype = Object.getPrototypeOf(provider);
                return this.metadataScanner.scanFromPrototype(provider, instancePrototype, method =>
                    this.exploreMethodMetadata(provider, instancePrototype, method, metadataParameter)
                );
            })
            .reduce((prev, curr) => {
                return prev.concat(curr);
            });
    }
}

export class MethodInfo {
    key: string;
    target: string;
    methodName: string | symbol;
    callback: () => any | null;
}

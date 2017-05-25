export function Required(message: string) {
    return function (target, propertyKey: string) {
        //console.log('REQ: ', target, propertyKey, message);
        // Object.defineProperty(target, propertyKey, {
        //     configurable: false,
        //     get: () => message
        // });
    }
}

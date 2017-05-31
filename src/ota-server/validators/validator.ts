import { Thenable } from 'any-promise';
import * as Ajv from 'ajv';
import { Schemas } from './schemas';
export class Validator {
    private static validators = {};
    static ValidateData(schemaName: string, data: any): any {
        var result :any= { valid: false }
        try {
            if (!Validator.validators[schemaName]) {
                var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
                Validator.validators[schemaName] = ajv.compile(Schemas[schemaName]);
            }
           var valid = Validator.validators[schemaName](data);
           result= { valid: valid, errors: Validator.validators[schemaName].errors }
        } catch (error) {
            console.log(error);
        }
        return result;

    }

}

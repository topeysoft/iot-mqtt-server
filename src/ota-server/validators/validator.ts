import { Thenable } from 'any-promise';
import * as Ajv from 'ajv';
import { Schemas } from './schemas';
export class Validator {
    private static validators = {};
    static ValidateData(schemaName: string, data: any): any {
        let result :any= { valid: false }
        let schema =Schemas[schemaName];
        try {
            if (!Validator.validators[schemaName]) {
                let options:Ajv.Options = {};
                options.allErrors=true;
                let ajv = new Ajv(options);
                let v= ajv.compile(schema);
                Validator.validators[schemaName]=v;
            }
        let valid = Validator.validators[schemaName](data);
           result= { valid: valid, errors: Validator.validators[schemaName].errors }
        } catch (error) {
            console.log(error);
        }
        return result;

    }

}

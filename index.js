
export { toStruct, fromStruct };

/**
 * Takes an object and converts it to the correct Struct
 * format to be transmitted over gRPC.
 */

function toStruct(obj, debug = false) {

    const struct = { fields: {} };

    for (const [ key, value ] of Object.entries(obj)) {

        switch (typeof value) {

            case 'object':

                if (Array.isArray(value)) {
                    // deal with array
                    struct.fields[key] = toListValue(value, debug);
                } else {
                    // deal with regular object
                    struct.fields[key] = { structValue: toStruct(value, debug), kind: 'structValue' };
                }
                
                break;

            case 'string':

                struct.fields[key] = { stringValue: value, kind: 'stringValue' };

                break;

            case 'number':

                struct.fields[key] = { numberValue: value, kind: 'numberValue' };

                break;

            case 'boolean':

                struct.fields[key] = { booleanValue: value, kind: 'booleanValue' };

                break;
        
            default:
                if (debug) console.error(`${key} is of type ${typeof value}, which is not configured.`);
                break;

        }

    }

    return struct;

}



/**
 * Takes an array and converts it to a listValue in the correct
 * Struct format.
 */

const toListValue = (array, debug = false) => {
    
    if (!array || !Array.isArray(array)) return {};

    const list = [];

    for (const id in array) {

        const item = array[id];

        switch (typeof item) {

            case 'object':

                if (Array.isArray(item)) {
                    // deal with array
                    list.push(toListValue(item));
                } else {
                    // deal with regular object
                    list.push({ structValue: toStruct(item) });
                }
                
                break;

            case 'string':

                list.push({ stringValue: item });

                break;

            case 'number':

                list.push({ numberValue: item });

                break;

            case 'boolean':

                list.push({ booleanValue: item });

                break;
        
            default:
                if (debug) console.error(`${item} is of type ${typeof item}, which is not configured.`);
                break;

        }

    }

    return { listValue: { values: list }, kind: 'listValue' };
    
}




/**
 * Takes a Struct object and converts it back into the original JSON/JavaScript object.
 */

function fromStruct(struct, debug = false) {
    const result = {};

    for (const [key, value] of Object.entries(struct.fields)) {

        switch (value.kind) {

            case 'structValue':

                result[key] = fromStruct(value.structValue, debug);

                break;

            case 'listValue':

                result[key] = fromListValue(value.listValue, debug);

                break;

            case 'stringValue':

                result[key] = value.stringValue;

                break;

            case 'numberValue':

                result[key] = value.numberValue;

                break;

            case 'booleanValue':

                result[key] = value.booleanValue;

                break;

            default:
                if (debug) console.error(`Type ${value.kind} is not configured.`);
                break;

        }

    }

    return result;
}



/**
 * Takes a listValue and converts it to an array.
 */

const fromListValue = (listValue, debug = false) => {

    const values = listValue.values;
    
    if (!values || !Array.isArray(values)) return {};

    const list = [];

    for (const id in values) {

        const item = values[id];

        switch (item.kind) {

            case 'structValue':

                list.push(fromStruct(item.structValue, debug));
                
                break;

            case 'listValue':

                list.push(fromListValue(item.listValue, debug));

                break;

            case 'stringValue':

                list.push(item.stringValue);

                break;

            case 'numberValue':

                list.push(item.numberValue);

                break;

            case 'booleanValue':

                list.push(item.booleanValue);

                break;
        
            default:
                if (debug) console.error(`Type ${item.kind} is not configured.`);
                break;

        }

    }

    return list;
    
}
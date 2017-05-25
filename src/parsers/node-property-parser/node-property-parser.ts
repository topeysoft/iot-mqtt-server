export class NodePropertyParser {
    valueProps: any;
    rangeProps: any;
    rangePropPattern = /([a-z]+\[\d+-\d+\]:[a-z]*)/g;
    valuePropPattern = /([a-z_\-]{1,}:[a-z]*)/g;
    rangePropMinPattern = /([a-z_\-]{1,}:[a-z]*)/g;
    minPropPattern = /\d+(?=-\d+\])/g;
    maxPropPattern = /\d+(?=\])/g;
    rangePropIdentifier = /[a-zA-Z](?=\[)/g;
    valuePropIdentifier = /[a-zA-Z_-]+(?=:[a-zA-Z])/g;
    settablePattern = /:(.*?)[a-zA-Z]+/g;

    parse(propertyString) {
        //  var sample = 'r[1-1023]:settable,g[1-1023]:settable,b[1-1023]:settable,r-on:settable,g-on:settable,    b-on:settable,  g,   k:test';

        this.rangeProps = propertyString.match(this.rangePropPattern);
        console.log('rangeProps', this.rangeProps);
        this.valueProps = propertyString.match(this.valuePropPattern);
        console.log('valueProps', this.valueProps);


        return this.buildProperty();
    }
    private buildProperty() {
        var properties = [];
        this.rangeProps = this.rangeProps || [];
        this.valueProps = this.valueProps || [];
        this.rangeProps.forEach((v, i) => {
            var identifier = v.match(this.rangePropIdentifier)[0];
            var property = {
                identifier: identifier,
                is_range: true,
                is_settable: v.match(this.settablePattern)[0] === ':settable',
                min: parseInt(v.match(this.minPropPattern)[0]),
                max: parseInt(v.match(this.maxPropPattern)[0]),
                action: {
                    topic: `{device_base}{device_id}/{node_id}/${identifier}_{value}/set`
                }
            };
            properties.push(property)
        })

        this.valueProps.forEach((v, i) => {
            var identifier = v.match(this.valuePropIdentifier)[0];
            properties.push({
                identifier: identifier,
                is_range: false,
                is_settable: v.match(this.settablePattern)[0] === ':settable',
                action: {
                    topic: `{device_base}{device_id}/{node_id}/${identifier}/set`
                }
            })
            console.log('ID', v.match(this.valuePropIdentifier));
        })
        console.log('Properties', properties);
        return properties;
    }
}
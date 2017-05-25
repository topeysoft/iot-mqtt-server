"use strict";
class NodePropertyParser {
    constructor() {
        this.rangePropPattern = /([a-z]+\[\d+-\d+\]:[a-z]*)/g;
        this.valuePropPattern = /([a-z_\-]{1,}:[a-z]*)/g;
        this.rangePropMinPattern = /([a-z_\-]{1,}:[a-z]*)/g;
        this.minPropPattern = /\d+(?=-\d+\])/g;
        this.maxPropPattern = /\d+(?=\])/g;
        this.rangePropIdentifier = /[a-zA-Z](?=\[)/g;
        this.valuePropIdentifier = /[a-zA-Z_-]+(?=:[a-zA-Z])/g;
        this.settablePattern = /:(.*?)[a-zA-Z]+/g;
    }
    parse(propertyString) {
        //  var sample = 'r[1-1023]:settable,g[1-1023]:settable,b[1-1023]:settable,r-on:settable,g-on:settable,    b-on:settable,  g,   k:test';
        var rangeProps = propertyString.match(this.rangePropPattern);
        console.log('rangeProps', rangeProps);
        var valueProps = propertyString.match(this.valuePropPattern);
        console.log('valueProps', valueProps);
        var valueProps = propertyString.match(this.valuePropPattern);
        console.log('valueProps', valueProps);
        return this.buildProperty();
    }
    buildProperty() {
        var properties = [];
        this.rangeProps.forEach((v, i) => {
            properties.push({
                identifier: v.match(this.rangePropIdentifier)[0],
                is_range: true,
                is_settable: v.match(this.settablePattern)[0] === ':settable',
                min: v.match(this.minPropPattern)[0],
                max: v.match(this.maxPropPattern)[0]
            });
        });
        this.valueProps.forEach((v, i) => {
            properties.push({
                identifier: v.match(this.valuePropIdentifier)[0],
                is_range: false,
                is_settable: v.match(this.settablePattern)[0] === ':settable'
            });
            console.log('ID', v.match(this.valuePropIdentifier));
        });
        console.log('Properties', properties);
        return properties;
    }
}
exports.NodePropertyParser = NodePropertyParser;
//# sourceMappingURL=node-property-parser.js.map
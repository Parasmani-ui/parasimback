import React from "react";
import Icon from '../components/Icon';

const addThousands = function (num) {
  let parts = num.toString().split('.');
  let integerPart = parts[0];
  let decimalPart = parts[1] || '';
  let formattedIntegerPart = '';
  for (let i = integerPart.length - 1, j = 0; i >= 0; i--, j++) {
    if (j % 3 === 0 && j !== 0) {
      formattedIntegerPart = ',' + formattedIntegerPart;
    }
    formattedIntegerPart = integerPart[i] + formattedIntegerPart;
  }
  formattedIntegerPart = formattedIntegerPart.replace(/^\,/, '').replace(/^\-\,/, '-');
  return formattedIntegerPart + (decimalPart ? '.' + decimalPart : '');
  //return num.toString().replace(/\B(?\=(\d{3})+(?!\d))/g, ","); // could be cause of a potential bug in safari to surface
};

const _formats = {
  thousands_indicator_int: function (caseStudy, value) {
    const val = addThousands(parseInt(value));
    return <span>{val}</span>;
  },

  number_dec: function (caseStudy, value) {
    const val = addThousands(parseFloat(value).toFixed(2));
    return <span>{val}</span>;
  },

  price_int: function (caseStudy, value) {
    const val = addThousands(parseInt(value));
    return <span><Icon name={caseStudy.currency} /><span>{val}</span></span>;
  },

  price_dec: function (caseStudy, value) {
    const val = addThousands(parseFloat(value).toFixed(2));
    return <span><Icon name={caseStudy.currency} /><span>{val}</span></span>;
  },

  amount_int: function (caseStudy, value) {
    var output = '';
    var className = '';
    const val = parseInt(value);

    if (value < 0) {
      output = '(' + addThousands(Math.abs(val)) + ')';
      className = 'negative_amount';
    }
    else {
      output = addThousands(val);
      className = 'positive_amount';
    }

    return <span className={className}><Icon name={caseStudy.currency} /><span>{output}</span></span>;
  },

  percent_dec: function (caseStudy, value) {
    var output = '';
    var className = '';
    const val = parseFloat(value).toFixed(2);

    if (value < 0) {
      output = '(' + addThousands(Math.abs(val)) + ')%';
      className = 'negative_amount';
    }
    else {
      output = addThousands(val) + '%';
      className = 'positive_amount';
    }

    return <span className={className}><span>{output}</span></span>;
  },
};

const defaultFunctions = {
  required_workforce: (user, caseStudy, gameData, context) => {
    return 'tbd: hooks->required_workforce';
  },

  find_feature_in_casestudy: (user, caseStudy, gameData, context) => {
    const featureName = context.name;
    const specs = caseStudy.product.specs;

    for (var i = 0; i < specs.length; i++) {
      if (featureName == specs[i].feature) {
        return specs[i];
      }
    }

    return null;
  },

  feature_value: (user, caseStudy, gameData, context) => {
    const featureName = context.name;
    const value = context.value;

    const feature = _functions.find_feature_in_casestudy(user, caseStudy, gameData, { name: context.name });
    if (!feature) {
      console.error('feature not found', context.name, caseStudy.product.specs);
      return null;
    }

    const values = feature.values;

    for (var i = 0; i < values.length; i++) {
      if (value == values[i].value) {
        return values[i];
      }
    }

    return null;
  },

  product_cost: (user, caseStudy, gameData, context) => {
    const product = context;
    var cost = parseInt(caseStudy.product.overhead_cost || 0);

    const specs = {};
    caseStudy.product.specs.forEach((spec) => {
      specs[spec.feature] = {...spec};
      const values = {};
      spec.values.forEach((val) => {
        values[val.value] = val;
      });
      specs[spec.feature].values = values;
    });

    for (var prop in product.specs) {
      const feature = specs[prop];
      if (!feature) {
        continue;
      }

      const value = feature.values[product.specs[prop]];
      if (!value) {
        continue;
      }

      cost += parseInt(value.cost || 0);
    }

    return cost;
  },

  margin: (user, caseStudy, gameData, context) => {
    const product = context;
    const cost = _functions.product_cost(user, caseStudy, gameData, context);
    const salesPrice = parseInt(product.salesPrice || 0);
    return salesPrice - cost;
  },

  margin_pct: (user, caseStudy, gameData, context) => {
    const product = context;
    const margin = _functions.margin(user, caseStudy, gameData, context);
    const salesPrice = parseInt(product.salesPrice || 0);
    const value = (margin / salesPrice) * 100;
    return value;
  },
};

const _serverHooks = {
  'sadmin/caseStudy_out': (serviceName, user, inputData, context, output) => {
    /*
    // sort and index the produc variants array
    const productIdx = output.product;
    const variants = productIdx.variants.sort((a, b) => { return a.idx - b.idx; });

    const variantIdx = {};
    variants.forEach(val => {
      variantIdx[val.name] = val;
    });

    productIdx.variantIdx = variantIdx;

    // sort and index the specs array
    const specs = productIdx.specs.sort((a, b) => { return a.idx - b.idx; });

    specsIdx = {};
    specs.forEach(feature => {
      const featureValues = feature.values.sort((a, b) => { return a.idx - b.idx; });
      const featureIdx = {};
      featureValues.forEach(f => {
        featureIdx[f.value] = f;
      });

      specsIdx[feature.feature] = feature;
    });

    productIdx.specsIdx = specsIdx;

    // calculate cost and margin

    output.productIdx = productIdx;
    */



    return output;
  },
};

export var serverHooks = _serverHooks;
export var _functions = defaultFunctions;
export var formats = _formats;

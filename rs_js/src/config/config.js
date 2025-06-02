// Configuration for relative sizes application
export const config = {
  "scales": [
    {
      "name": "time",
      "defaultUnit": "seconds",
      "units": [
        {
          "name": "second",
          "plural": "seconds",
          "conversionFactor": 1,
          "decimalPlaces": 0
        },
        {
          "name": "minute",
          "plural": "minutes",
          "conversionFactor": 60,
          "decimalPlaces": 1
        },
        {
          "name": "hour",
          "plural": "hours",
          "conversionFactor": 3600,
          "decimalPlaces": 1
        },
        {
          "name": "day",
          "plural": "days",
          "conversionFactor": 86400,
          "decimalPlaces": 1
        },
        {
          "name": "week",
          "plural": "weeks",
          "conversionFactor": 604800,
          "decimalPlaces": 1
        },
        {
          "name": "month",
          "plural": "months",
          "conversionFactor": 2592000,
          "decimalPlaces": 1
        },
        {
          "name": "year",
          "plural": "years",
          "conversionFactor": 31536000,
          "decimalPlaces": 1
        }
      ]
    },
    {
      "name": "distance",
      "defaultUnit": "meters",
      "units": [
        {
          "name": "millimeter",
          "plural": "millimeters",
          "conversionFactor": 0.001,
          "decimalPlaces": 1
        },
        {
          "name": "centimeter",
          "plural": "centimeters",
          "conversionFactor": 0.01,
          "decimalPlaces": 1
        },
        {
          "name": "meter",
          "plural": "meters",
          "conversionFactor": 1,
          "decimalPlaces": 1
        },
        {
          "name": "kilometer",
          "plural": "kilometers",
          "conversionFactor": 1000,
          "decimalPlaces": 1
        }
      ]
    },
    {
      "name": "weight",
      "defaultUnit": "grams",
      "units": [
        {
          "name": "milligram",
          "plural": "milligrams",
          "conversionFactor": 0.001,
          "decimalPlaces": 1
        },
        {
          "name": "gram",
          "plural": "grams",
          "conversionFactor": 1,
          "decimalPlaces": 1
        },
        {
          "name": "kilogram",
          "plural": "kilograms",
          "conversionFactor": 1000,
          "decimalPlaces": 1
        },
        {
          "name": "ton",
          "plural": "tons",
          "conversionFactor": 1000000,
          "decimalPlaces": 2
        },
        {
          "name": "ounce",
          "plural": "ounces",
          "conversionFactor": 28.3495,
          "decimalPlaces": 1
        },
        {
          "name": "pound",
          "plural": "pounds",
          "conversionFactor": 453.592,
          "decimalPlaces": 1
        }
      ]
    }
  ]
};

// Make it available globally for browser scripts
if (typeof window !== 'undefined') {
  window.config = config;
}

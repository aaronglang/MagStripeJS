const parser = require('./src/parsers');
const test_data = require('./tests/test_data');

parser.test_data = test_data;
module.exports = parser;
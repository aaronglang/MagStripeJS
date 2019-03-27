const parser = require('./src/parsers');
const read_line = require('readline');

if(process.argv[2] === '--cli') {
    const rl = read_line.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on('line', (input) => {
        let stdout;
        if(/%B\d{10,20}\^\w+/.test(input)) {
            stdout = parser.parse_card(input);
        } else if(/%[a-z]+\^\w+/i.test(input)) {
            stdout = parser.parse_id(input);
        }
        console.table(stdout);
    });
}
module.exports = parser;
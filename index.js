const parser = require('./parsers');
const read_line = require('readline');
const exec = require('child_process').exec;

if(process.argv[2] === '--cli') {
    const rl = read_line.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on('line', (input) => {
        let res;
        for (let func of Object.keys(parser)) {
            if(['parse_id', 'parse_card'].includes(func)) {
                res = parser[func](input);
                if(res) {
                    console.log(res);
                    exec(`say \"hello ${res.first_name + ' ' + res.last_name}! Thank you for your payment'}.\"`);
                    break;
                }
            }
        }
    });
} else {
    module.exports = parser;
}
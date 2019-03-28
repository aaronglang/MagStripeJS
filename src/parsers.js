'use strict';
const read_line = require('readline');


/**
 * Parses data from magnetic stripe on most cards containing track 1,2,3 type data
 * @param {string} str
 * @return {object|null}
 */
const parse_card = (str) => {
    if(typeof str !== 'string') return null;
    let regexp = /((?<=%b)\d+(?=\^))|((?<=\^)[\w\/\s]+(?=\^))|((?<==)\d{4})/gi;
    let matches = str.match(regexp);
    if(matches && matches.length > 2) {
        return map_card_data(matches);
    } else {
        return null;
    }
};

/**
 * Parses data from magnetic stripe on most state-issued identification cards
 * @param {string} str
 * @return {object|null}
 */
const parse_id = (str) => {
    if(typeof str !== 'string') return null;
    let data = parse_string(str);
    if(!data) return null;
    let {age, expired} = format_dates(data);
    let name = data[0].split('$');
    return {
        first_name: name[1],
        last_name: name[0],
        under_21: !!(age < 21),
        under_18: !!(age < 18),
        expired: !!(expired > 0),
        age: age,
        dob: data[2],
        doe: data[1]
    };
};

/**
 * Creates commandline prompt which parses input from keyboard and logs parsed object to console (for debugging/testing purposes)
 */
const cli = () => {
    const rl = read_line.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on('line', (input) => {
        let stdout;
        if(/%B\d{10,20}\^\w+/.test(input)) {
            stdout = parse_card(input);
        } else if(/%[a-z]+\^\w+/i.test(input)) {
            stdout = parse_id(input);
        }
        console.table(stdout);
    });
};

// todo: parse_pdf417 function for barcode

/**
 * Parses input from ID card
 * @param {string} str
 * @return {array|null}
 */
const parse_string = (str) => {
    let exp = /(?=[^])(\w+[$]\w+)|(\w+[$]\w+)(?<=[^])|(?<=;\d{1,20}=\d{4})\d{8}(?=[?])|(?<=;\d{1,20}=)\d{4}(?=\d{8}[?])/gi;
    let _data = str.match(exp);
    if(_data && _data.length >= 3) {
        return _data.map( str => {
            return str.toLowerCase();
        });
    }
    else return null;
};

/**
 * Formats dates and returns age and expiration status from ID
 * @param {array<string>} data
 * @return {{age: number, expired: boolean}}
 */
const format_dates = (data) => {
    // format dates
    let date = new Date(+data[2].substr(0,4), +data[2].substr(4,2) - 1, +data[2].substr(6,2));
    let date_exp = new Date(+`20${data[1].substr(0,2)}`, +data[1].substr(2,2) - 1);
    // get diff of dates
    let now = new Date();
    let expired = date_diff_days(date_exp, now);
    let age = date_diff_years(now, date);
    return {age, expired};
};

/**
 * Gets the delta in days from date_1 to date_2
 * @param {Date} date_1
 * @param {Date} date_2
 * @return {number}
 */
const date_diff_days = (date_1, date_2) => {
    // get time diff
    let time_diff = date_2.getTime() - date_1.getTime();
    // return diff in days
    return Math.ceil(time_diff / (1000 * 3600 * 24));
};

/**
 * Gets the delta in years from date_1 to date_2
 * @param {Date} date_1
 * @param {Date} date_2
 * @return {number}
 */
const date_diff_years = (date_1, date_2) => {
    // get time diff
    let time_diff = Math.abs(date_2.getTime() - date_1.getTime());
    // return diff in days
    return Math.floor((time_diff / (1000 * 3600 * 24)) / 365.25);
};

/**
 * Iterates through array of matches from credit card string
 * @param {array} matches
 * @return {object}
 */
const map_card_data = (matches) => {
    let obj = {};
    matches.map(x => {
        if (/[\sa-z]+\/[\sa-z]+/gi.test(x)) {
            // get name
            let y = x.trim().split('\/');
            obj.first_name = y[1].trim().toLowerCase();
            obj.last_name = y[0].trim().toLowerCase();
        }
        else if (/^\d{16,20}$/.test(x)) {
            // get card number
            obj.card_number = +x.trim();
        } else if (/^\d{4}/gi.test(x)) {
            // check expiration
            let exp_data = check_card_expiration(x);
            Object.assign(obj, exp_data);
        }
    });
    return obj;
};

/**
 * Gets the expiration date/status from credit card data
 * @param {array} data
 * @return {object}
 */
const check_card_expiration = (data) => {
    let obj = {};
    obj.expiration_date = data.trim().match(/\d{2}/g).reverse().join('/');
    let now = new Date();
    let expiration_date = new Date(+`20${obj.expiration_date.substr(3, 2)}`, +obj.expiration_date.substr(0, 2) - 1);
    let expired = date_diff_days(expiration_date, now);
    obj.expired = !!(expired > 0);
    return obj;
};

module.exports = {
    parse_string,
    date_diff_days,
    date_diff_years,
    parse_id,
    parse_card,
    cli
};
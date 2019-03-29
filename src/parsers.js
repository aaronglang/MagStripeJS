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
        license_number: data[3],
        under_21: !!(age < 21),
        under_18: !!(age < 18),
        expired: !!(expired > 0),
        age: age,
        date_of_birth: data[2],
        expiration_date: data[1]
    };
};

/**
 * Parses data from PDF417 barcode found on most state-issued identification cards
 * @param {string} str
 * @return {object|null}
 */
const parse_pdf417 = (str) => {
    if(typeof str !== 'string') return null;
    let main_exp = /(?<=ansi\s+\d{12}dl\w+dl)[\w\s]+(?=dcf)/gi;
    let second_exp = /(?=dbb)|(?=dbl)|(?=dba)|(?=dac)|(?=dct)|(?=dbp)|(?=dcs)|(?=dbo)|(?=daa)|(?=daq)|(?=ddf)|(?=dde)|(?=ddg)|(?=dce)|(?=dad)|(?=dca)|(?=dcb)|(?=dbd)|(?=dbc)|(?=dau)|(?=dag)|(?=dai)|(?=daj)|(?=dak)/gi;
    let _data = str.match(main_exp);
    if(!_data) return null;
    let data = _data[0].split(second_exp);
    if(data && data.length >= 4) {
        // GET INFO
        let obj = loop_pdf417_data(data);
        // FORMAT DATES
        let dates = format_pdf417_dates(obj);
        // GET AGE AND EXPIRATION STATUS
        let now = new Date();
        let age = date_diff_years(dates.date_of_birth, now);
        let expired = date_diff_days(dates.expiration_date, now);
        // FORMAT RETURN OBJECT
        return {
            first_name: obj.first_name,
            last_name: obj.last_name,
            license_number: obj.license_number,
            under_21: !!(age < 21),
            under_18: !!(age < 18),
            expired: !!(expired > 0),
            age: age,
            date_of_birth: obj.date_of_birth,
            expiration_date: obj.expiration_date
        }
    } else {
        return null;
    }
};

/**
 * Creates commandline prompt which parses input from keyboard and logs parsed object to console (for debugging/testing purposes)
 * This function will loop test the input string to determine the source of data (credit card, pdf417 etc.) and will output the result
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
        } else if(/%[a-z\s]+\^\w+/i.test(input)) {
            stdout = parse_id(input);
        } else if(/(?<=ansi\s+\d{12}dl\w+dl)[\w\s]+(?=dcf)/gi.test(input)) {
            stdout = parse_pdf417(input);
        }
        console.log(stdout);
    });
};

/**
 * Parses input from ID card
 * @param {string} str
 * @return {array|null}
 */
const parse_string = (str) => {
    let exp = /(?=[^])(\w+[$]\w+)|(\w+[$]\w+)(?<=[^])|(?<=;\d{1,20}=\d{4})\d{8}(?=[?])|(?<=;\d{1,20}=)\d{4}(?=\d{8}[?])/gi;
    let _data = str.match(exp);
    let license_number = str.match(/((?<=;\d{7})\d{6,10})/gi);
    if(_data && license_number) _data.push(license_number[0]);
    if(_data && _data.length >= 4) {
        return _data.map( str => {
            return str.toLowerCase();
        });
    }
    else return null;
};

/**
 * Formats dates and returns age and days from expiration from ID
 * @param {array<string>} data
 * @return {{age: number, expired: number}}
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
 * @param {string} str
 * @return {object}
 */
const check_card_expiration = (str) => {
    let obj = {};
    obj.expiration_date = str.trim().match(/\d{2}/g).reverse().join('/');
    let now = new Date();
    let expiration_date = new Date(+`20${obj.expiration_date.substr(3, 2)}`, +obj.expiration_date.substr(0, 2) - 1);
    let expired = date_diff_days(expiration_date, now);
    obj.expired = !!(expired > 0);
    return obj;
};

/**
 * Loops through matches from regular expression to get ID information
 * @param {array} data Array of matches of regular expression
 * @return {{first_name: string, last_name: string, license_number: string, date_of_birth: string, expiration_date: string}}
 */
const loop_pdf417_data = (data) => {
    let first_name, last_name, license_number, date_of_birth, expiration_date;
    for (let str of data) {
        if (/daa/gi.test(str)) {
            let arr = str.split(/\W/);
            first_name = `${arr[1]} ${arr[2]}`.toLowerCase();
            last_name = arr[0].match(/(?<=daa).*/i)[0].toLowerCase();
        } else if (/dac|dct|dbp/gi.test(str)) {
            first_name = str.match(/(?<=dac|dct|dbp)(.*)/gi)[0].toLowerCase().trim();
        } else if (/dcs|dbo/gi.test(str)) {
            last_name = str.match(/(?<=dcs|dbo)(.*)/gi)[0].toLowerCase().trim();
        } else if (/daq/gi.test(str)) {
            license_number = str.match(/(?<=daq)(\w+)/gi)[0];
        } else if(/dbb|dbl/gi.test(str)) {
            date_of_birth = str.match(/(?<=dbb|dbl)[0-9]{8}/gi)[0];
        } else if(/dba/gi.test(str)) {
            expiration_date = str.match(/(?<=dba)[0-9]{8}/gi)[0];
        }
    }
    return {first_name, last_name, license_number, date_of_birth, expiration_date};
};

/**
 * Formats birth date and expiration date into JavaScript Date objects
 * @param {object} obj
 * @param {string} obj.date_of_birth Date of birth string as parsed from barcode
 * @param {string} obj.expiration_date Expiration date string as parsed from barcode
 * @return {{date_of_birth: Date, expiration_date: Date}}
 */
const format_pdf417_dates = (obj) => {
    let expiration_date, date_of_birth;
    if(parseInt(obj.date_of_birth.match(/\d{4}/)[0]) < 1920 && parseInt(obj.expiration_date.match(/\d{4}/)[0]) < 1900) {
        date_of_birth = new Date(+obj.date_of_birth.substr(4,4), +obj.date_of_birth.substr(2,2), +obj.date_of_birth.substr(0,2));
        expiration_date = new Date(+obj.expiration_date.substr(4,4), +obj.expiration_date.substr(2,2), +obj.expiration_date.substr(0,2))
    } else {
        date_of_birth = new Date(+obj.date_of_birth.substr(0,4), +obj.date_of_birth.substr(4,2), +obj.date_of_birth.substr(6,2));
        expiration_date = new Date(+obj.expiration_date.substr(0,4), +obj.expiration_date.substr(4,2), +obj.expiration_date.substr(6,2));
    }
    return {date_of_birth, expiration_date};
};

module.exports = {
    parse_string,
    date_diff_days,
    date_diff_years,
    parse_id,
    parse_card,
    parse_pdf417,
    format_pdf417_dates,
    loop_pdf417_data,
    cli
};
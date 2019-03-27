'use strict';

const parse_card = (data) => {
    if(typeof data !== 'string') return null;
    let regexp = /((?<=%b)\d+(?=\^))|((?<=\^)[\w\/\s]+(?=\^))|((?<==)\d{4})/gi;
    let obj = {};
    let matches = data.match(regexp);
    if(matches && matches.length > 2) {
        matches.map(x => {
            if (/[\sa-z]+\/[\sa-z]+/gi.test(x)) {
                // get name
                let y = x.trim().split('\/');
                obj.first_name = y[1].trim().toLowerCase();
                obj.last_name = y[0].trim().toLowerCase();
            }
            else if(/^\d{16,20}$/.test(x)) {
                // get card number
                obj.card_number = +x.trim();
            } else if (/^\d{4}/gi.test(x)) {
                // check expiration
                obj.exp_date = x.trim().match(/\d{2}/g).reverse().join('/');
                let now = new Date();
                let exp_date = new Date(+`20${obj.exp_date.substr(3,2)}`, +obj.exp_date.substr(0,2) - 1);
                let expired = date_diff_days(exp_date, now);
                obj.expired = !!(expired > 0);
            }
        });
        return obj;
    } else {
        return null;
    }
};

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

const date_diff_days = (date_1, date_2) => {
    // get time diff
    let time_diff = date_2.getTime() - date_1.getTime();
    // return diff in days
    return Math.ceil(time_diff / (1000 * 3600 * 24));
};

const date_diff_years = (date_1, date_2) => {
    // get time diff
    let time_diff = Math.abs(date_2.getTime() - date_1.getTime());
    // return diff in days
    return Math.floor((time_diff / (1000 * 3600 * 24)) / 365.25);
};

module.exports = {
    parse_string,
    date_diff_days,
    date_diff_years,
    format_dates,
    parse_id,
    parse_card
};
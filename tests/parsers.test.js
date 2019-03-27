const parser = require('../parsers');
const credit_str = '%B1234567812345678^LANGLEY/AARON ^2311201107631100000000580000000?;1234567812345678=231120110763580?';
const credit_str_exp = '%B1234567812345678^LANGLEY/AARON ^1811201107631100000000580000000?;1234567812345678=181120110763580?';
const id_str = '%CAHUNTINGTN BC^SAGLIETTO$MARCO$RAFFAELE^5661 MIDDLECOFF DR^?;636014063627831=211219931223?#!!92649    C     M507190BRNBRN D69820170124      EV/.R\\!?,2(?';
const id_str_exp = '%CAHUNTINGTN BC^SAGLIETTO$MARCO$RAFFAELE^5661 MIDDLECOFF DR^?;636014063627831=181219931223?#!!92649    C     M507190BRNBRN D69820170124      EV/.R\\!?,2(?';
const bad_param_arr = ['%E?;E?', 'asdfasdfasdf12345', '', '%CAHUNTINGTN BC^SAGLIETTO$MARCO$RAFFAELE', 1234567, true, false, '%B1234567812345678^LANGLEY/AARON ^2311201107631100000000580000'];

test('should parse data from credit card mag stripe', () => {
    expect(parser.parse_card(id_str)).toBeNull();
    expect(parser.parse_card(credit_str)).toEqual(
        {
            card_number: 1234567812345678,
            first_name: 'aaron',
            last_name: 'langley',
            exp_date: '11/23',
            expired: false
        });
    expect(parser.parse_card(credit_str_exp)).toEqual(
        {
            card_number: 1234567812345678,
            first_name: 'aaron',
            last_name: 'langley',
            exp_date: '11/18',
            expired: true
        });
});

test('should parse data from id card mag stripe', () => {
    expect(parser.parse_id(credit_str)).toBeNull();
    expect(parser.parse_id(id_str)).toEqual(
        {
            first_name: 'marco',
            last_name: 'saglietto',
            under_21: false,
            under_18: false,
            expired: false,
            age: 25,
            dob: '19931223',
            doe: '2112'
        });
    expect(parser.parse_id(id_str_exp)).toEqual(
        {
            first_name: 'marco',
            last_name: 'saglietto',
            under_21: false,
            under_18: false,
            expired: true,
            age: 25,
            dob: '19931223',
            doe: '1812'
        });
});

test('should return a delta of days', () => {
    let now = new Date(2019, 1, 1), then = new Date(2018, 1, 1);
    expect(parser.date_diff_days(then, now)).toBe(365);
});

test('should return a delta of years', () => {
    let now = new Date(1918, 1), then = new Date(2018, 1);
    expect(parser.date_diff_years(then, now)).toBe(100);
});

test('parse string input from card reader', () => {
    expect(parser.parse_string('asdfasdfasdf')).toBeNull();
    expect(parser.parse_string(id_str)).toEqual([ 'saglietto$marco', '2112', '19931223' ]);
});

test('should return formatted object with age, and expired boolean', () => {
    let arr = [ 'saglietto$marco', '2112', '19931223' ];
    let res = { age: 25, expired: -980 };
    expect(parser.format_dates(arr)).toEqual(res);
});

// FAILED TESTS
test('parse_id should fail to parse bad input', () => {
    bad_param_arr.forEach(str => {
        expect(parser.parse_id(str)).toBeNull();
    });
});

test('parse_card should fail to parse bad input', () => {
    bad_param_arr.forEach(str => {
        expect(parser.parse_card(str)).toBeNull();
    });
});
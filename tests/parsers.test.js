const parser = require('../src/parsers');
const samples = require('./test_data');
const credit_str = samples.credit_card;
const credit_str_exp = samples.credit_card_expired;
const id_str = samples.id;
const id_str_exp = samples.id_expired;
const pdf417_id = samples.pdf417_id;
const pdf417_id_expired = samples.pdf417_id_expired;
const bad_param_arr = ['%E?;E?', 'asdfasdfasdf12345', '', '%CAHUNTINGTN BC^DOE$JOHN$MIDDLE', 1234567, true, false, '%B1234567812345678^DOE/JOHN ^123', pdf417_id.substr(0,28)];

// INTEGRATION TESTS
test('should parse data from credit card mag stripe', () => {
    expect(parser.parse_card(id_str)).toBeNull();
    expect(parser.parse_card(pdf417_id)).toBeNull();
    expect(parser.parse_card(credit_str)).toEqual(
        {
            card_number: 1234567812345678,
            first_name: 'john',
            last_name: 'doe',
            expiration_date: '11/23',
            expired: false
        });
    expect(parser.parse_card(credit_str_exp)).toEqual(
        {
            card_number: 1234567812345678,
            first_name: 'john',
            last_name: 'doe',
            expiration_date: '11/18',
            expired: true
        });
});

test('should parse data from id card mag stripe', () => {
    expect(parser.parse_id(credit_str)).toBeNull();
    expect(parser.parse_id(pdf417_id)).toBeNull();
    expect(parser.parse_id(id_str)).toEqual(
        {
            first_name: 'john',
            last_name: 'doe',
            license_number: '81234567',
            under_21: false,
            under_18: false,
            expired: false,
            age: 25,
            date_of_birth: '19931223',
            expiration_date: '2112'
        });
    expect(parser.parse_id(id_str_exp)).toEqual(
        {
            first_name: 'john',
            last_name: 'doe',
            license_number: '81234567',
            under_21: false,
            under_18: false,
            expired: true,
            age: 25,
            date_of_birth: '19931223',
            expiration_date: '1812'
        });
});

test('should parse data from PDF417 barcode found on most state-issued ID cards', () => {
    expect(parser.parse_pdf417(credit_str)).toBeNull();
    expect(parser.parse_pdf417(id_str)).toBeNull();
    expect(parser.parse_pdf417(pdf417_id)).toEqual(
        {
            first_name: 'jane',
            last_name: 'doe',
            license_number: '123456789',
            under_21: false,
            under_18: false,
            expired: false,
            age: 24,
            date_of_birth: '05081994',
            expiration_date: '05082022'
        });
    expect(parser.parse_pdf417(pdf417_id_expired)).toEqual(
        {
            first_name: 'jane',
            last_name: 'doe',
            license_number: '123456789',
            under_21: false,
            under_18: false,
            expired: true,
            age: 24,
            date_of_birth: '05081994',
            expiration_date: '05082018'
        });
});

// UNIT TESTS
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
    expect(parser.parse_string(id_str)).toEqual([ 'doe$john', '2112', '19931223', '81234567' ]);
});

test('should loop through array of matches and return a formatted object', () => {
    expect(parser.loop_pdf417_data(['asdfasdf', 'asdfasdf', 'asdfasdf']));
    expect(parser.loop_pdf417_data(samples.pdf_417_array)).toEqual(
        samples.pdf_417_obj
    )
});

test('should convert parsed dates to JavaScript date objects', () => {
    expect(parser.format_pdf417_dates(samples.pdf_417_obj)).toEqual({
            date_of_birth: new Date('1994-09-05T00:00:00.00'),
            expiration_date: new Date('2022-09-05T00:00:00.00')
        });
});

// FAILED TESTS
test('parse_id should fail to parse bad/incomplete input', () => {
    bad_param_arr.forEach(str => {
        expect(parser.parse_id(str)).toBeNull();
    });
});

test('parse_card should fail to parse bad/incomplete input', () => {
    bad_param_arr.forEach(str => {
        expect(parser.parse_card(str)).toBeNull();
    });
});

test('parse_pdf417_id should fail to parse bad/incomplete input', () => {
    bad_param_arr.forEach(str => {
        expect(parser.parse_pdf417(str)).toBeNull();
    });
});
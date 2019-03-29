# mag-stripe [![Build Status](https://travis-ci.org/aaronglang/MagStripeJS.svg?branch=master)](https://travis-ci.org/aaronglang/MagStripeJS)
Magnetic stripe parser for credit-cards and state-issued identification cards.
Latest version also includes parser for PDF417 barcode data found on backs of state-issued identification cards.

## Shopping

[Here is a simple magstripe reader from Amazon](https://www.amazon.com/Deftun-3-Track-Magnetic-Magstripe-Scanner/dp/B01DVWQ2BO/ref=sr_1_4?crid=ZTWYQSBOYN7B&keywords=magstripe+reader&qid=1553725792&s=gateway&sprefix=mag+stripe+%2Caps%2C184&sr=8-4)

[Barcode scanner (parses PDF417 data-matrix barcodes)](https://www.amazon.com/Kercan-PDF417-Matrix-Barcode-Scanner/dp/B06XH58P9Y/ref=sr_1_3?crid=QBCB7WOTHT6M&keywords=pdf417+barcode+scanner&qid=1553888014&s=gateway&sprefix=pdf417+barcode%2Caps%2C227&sr=8-3)

**If you do not have a reader/scanner, feel free to use the sample mag-stripe or PDF417 data located in /tests/test_data.json**

## Getting Started

Want to build your own POS system? Go ahead and purchase the components above and get coding!

Both components should come as keyboard-input by default, however, some readers/scanners can be configured to use a different protocol. If you would like to use a different protocol (RS232 for example), follow instructions in your manual to configure the scanner/reader. Use a library like [serialport](https://www.npmjs.com/package/serialport) to capture frames sent from your scanner/reader. You will need to convert the received bytes into ASCII characters in order to use this library.

**Quick Start:**
- Install package `npm install --save mag-stripe`
- Plug in your virtual keyboard (scanner or mag-stripe reader)
- Use the `cli()` function documented [below](#cli-usage) - this function will grab the input from your scanner/card-reader and output the parsed data to the commandline

**Not-So-Quick Start**
- Install package `npm install --save mag-stripe`
- Build card-payment application
- On your 'swipe-credit-card-here' screen, grab the keyboard-input from your card reader and parse using this library!

Please be sure to use other people's data in an ethical manner ;)

Happy hacking!

## Documentation

### parse_card(*data: string*) -> {object}
Function parses input from ID mag-stripe and returns object:
```javascript
{
    card_number: 1234567812345678,
    first_name: 'john',
    last_name: 'doe',
    expiration_date: '11/23',
    expired: false
}
```

### parse_id(*data: string*) -> {object}

Function parses input from ID mag-stripe and returns object:
```javascript
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
}
```

### parse_pdf417(*data: string*) -> {object}
Function parses input from ID barcode and returns object:
```javascript
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
}
```

## Usage

index.js:
```javascript
const parser = require('mag-stripe');
const id_data = parser.test_data.id;
const credit_card_data = parser.test_data.credit_card;
const pdf417_data = parser.test_data.pdf417_id;

function get_id_data () {
    let data = parser.parse_id(id_data);
    // do something with ID info (check age?)
}

function get_credit_card_data () {
    let data = parser.parse_card(credit_card_data);
    // do something with credit card info
}

function get_pdf417_id_data () {
    let data = parser.parse_pdf417_id(pdf417_data);
    // do something with ID info
}
```

## CLI Usage

index.js:
```javascript
require('mag-stripe').cli();
```
Run: `node index.js` this method will create a readline stream - plug in your card reader and swipe!
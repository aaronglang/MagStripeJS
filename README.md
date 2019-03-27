# mag-stripe
Magnetic stripe parser for credit-cards and state-issued identification cards

### Shopping
[Here is a simple magstripe reader from Amazon](https://www.amazon.com/Deftun-3-Track-Magnetic-Magstripe-Scanner/dp/B01DVWQ2BO/ref=sr_1_4?crid=ZTWYQSBOYN7B&keywords=magstripe+reader&qid=1553725792&s=gateway&sprefix=mag+stripe+%2Caps%2C184&sr=8-4)

**If you do not have a reader, feel free to use the sample mag-stripe data located in /tests/test_data.json**

### Usage
---

Install package `npm install --save mag-stripe`

#### Code Sample:

```
const parser = require('mag-stripe');
const id_data = parser.test_data.id;
const credit_card_data = parser.test_data.credit_card;

function get_id_data (id_data) {
    let data = parser.parse_id(id_data);
    console.log(id_data);
    return data;
}

function get_credit_card_data (credit_card_data) {
    let data = parser.parse_id(credit_card_data);
    console.log(credit_card_data);
    return data;
}
```

### CLI Usage
---

run:
```
const parser = require('mag-stripe');
parser.cli();
```
This method creates a readline stream - plug in your card reader and swipe!

Happy hacking!
# jQuery Viewport Detector

A simple jQuery utility plugin that detects DOM objects as they scroll into the viewport.

This is still in its infency but it works very well. It's tested with most major and recent browsers.

Checkout the examples directory.

## How to Use

```javascript
$('body > ul').viewportDetector({
    selector: 'li',                 // The element that wraps the cards
    sensitivity: 0.2,               // A threshold set to tolerate fault (0.2 = 2%)
    activeClass: 'active-card',     // The class applied to cards within the viewport
    callback: {                     // A callback function that gets called on card change

        /**
         * @var int cardIndex   The index of the current active card
         * @var object card     The DOM object of the active card
         * @var object prev     The DOM object of the previously active card
         */
        cardChange: function (cardIndex, card, prev) {
            console.log('Card Activated:', cardIndex, card, prev);
        }
    }
});
```

Use at your own risk.

License: MIT.

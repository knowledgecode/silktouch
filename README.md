# SilkTouch
[![Circle CI](https://circleci.com/gh/knowledgecode/silktouch.svg?style=shield)](https://circleci.com/gh/knowledgecode/silktouch)  

SilkTouch is a small library for handling `touch` event in mobile web apps.

## WHY
In mobile browser, mainly Android Browser and iOS Safari, `click` event had a 300-350ms delay. Since the delay irritates users, we've had to handle it so as to react quickly to their tap operations. The good news is that in recent versions of those browsers it has been removed. However, we have to continue to handle it for a while to support older browsers.

## How Does It Work
This library will append the following viewport meta tag to a current page if not specified there.
```html
<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1">
```
If want to enable `user-scalable`, specify the viewport in advance. By the way, in iOS 10, the `user-scalable=no` is ignored. Take note if plan to support this version.  

It will also append the following css if the browser supports it.
```css
html {
    touch-action: manipulation;
}
```
In this way, in recent browsers the delay is able to be removed. In older browsers, this library will remove it with own method (using a `touchend` event).  

All the above are not applied to desktop browser. In any case, can handle `touch` event through the same interface.

## Features
- Small (approximately 1 kb, minifying and gzipping)
- No Dependency
- In desktop browser it also works

## Installation
*via npm:*
``` shell
$ npm install silktouch
```

*via Bower:*
``` shell
$ bower install silktouch
```

*directly:*
``` html
<script src="/path/to/silktouch.min.js"></script>
```

## Basic Usage
```html
<body>
  <div class="container">
    <div id="block">SSS...</div>
  </div>
</body>
```
```javascript
document.addEventListener('DOMContentLoaded', function () {
    // Initializing only once.
    silktouch.enchant(document.querySelector('.container'));

    // Register a new touch event.
    silktouch.on('green', '#block', function () {
        console.log('Creeper!');
    });
}, false);
```

## API
### *enchant([baseElement])*
- {Object} **[baseElement]** - A base element that manages a touch or a click event. Omitting it is equivalent to specify the `document`.

The `enchant` method initializes the `SilkTouch` object. This method must be called only once at the beginning. The `baseElement` will listen to all `touch` or `click` events for itsself and the descendant elements, and then dispatch them.

```javascript
silktouch.enchant();    // equivalent to `silktouch.enchant(document)`
```

#### NOTE
At least in iOS Safari, `touch` or `click` event usually will NOT be fired on the `document`. Thus, if your app supports iOS, the `baseElement` must be something other than it. The example is as follows:
```html
<body>
  <div class="container">

  </div>
</body>
```
```javascript
silktouch.enchant(document.querySelector('.container'));
```

### *on(name, selector, handler)*
- {string} **name** - A unique event name
- {string} **selector** - A selector you want to match.
- {Function} **handler** - An event listener

The `on` method registers a new `touch` event, and returns the `SilkTouch` object.
```html
<div id="cactus">block</div>
<div id="stone">block</div>
```
```javascript
// method chaining
silktouch
    .on('green', '#cactus', function () {
        console.log('Creeper!');
    })
    .on('gray', '#stone', function () {
        console.log('Skeleton!');
    });
```

### *one(name, selector, handler)*
- {string} **name** - A unique event name
- {string} **selector** - A selector you want to match.
- {Function} **handler** - An event listener that is fired only once.

The `one` method registers a new `touch` event that is fired **only once**, and returns the `SilkTouch` object.

### *off([name])*
- {string} **[name]** - An event name that want to delete from the registered events. Omitting it is equivalent to delete all the events.

The `off` method deletes from the registered events, and returns the `SilkTouch` object.

```javascript
silktouch.off('green');

// It's deleted all the events.
silktouch.off();
```

### *suspend([name])*
- {string} **[name]** - An event name that want to suspend. Omitting it is equivalent to suspend all the events.

The `suspend` method suspends one or all of the registed events, and returns the `SilkTouch` object. The events won't be fired until it's called the `resume` method.

```javascript
silktouch.suspend('gray');

// It's suspended all the events.
silktouch.suspend();
```

### *resume([name])*
- {string} **[name]** - An event name that want to resume. Omitting it is equivalent to resume all the events.

The `resume` method resumes one or all of the suspended events, and returns the `SilkTouch` object.

```javascript
silktouch.resume('gray');

// It's resumed all the suspended events.
silktouch.resume();
```

### *names([suspended])*
- {boolean} **[suspended]** - Whether getting the suspended event names instead of all the event names.

The `names` method returns all the registered or suspended event names.

```javascript
silktouch
    .on('green', '#cactus', function () {
        console.log('Creeper!');
    })
    .on('gray', '#stone', function () {
        console.log('Skeleton!');
    })
    .suspend('gray');

console.log(silktouch.names()); // ['green', 'gray']
console.log(silktouch.names(true)); // ['gray']
```

### *event.preventDefault()*

You can use `preventDefault` in event handler.

```javascript
silktouch.on('url-link', 'a', function (evt) {
    // Prevents to jump to another page.
    evt.preventDefault();
})
```

### *event.stopPropagation()*

`stopPropagation`, too.

```javascript
silktouch.on('absorbing', '.bubble', function (evt) {
    // Prevents the event bubbling.
    evt.stopPropagation();
})
```

## Browser Support
Android Browser 4+, Chrome, Firefox, Safari, Edge and IE9+

## License
MIT


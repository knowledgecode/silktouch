# SilkTouch
[![Circle CI](https://circleci.com/gh/knowledgecode/silktouch.svg?style=shield)](https://circleci.com/gh/knowledgecode/silktouch)  

SilkTouch is a small library for handling `touch` event in mobile web apps.

## WHY
As you may know, in mobile browser, Android Browser or iOS Safari, `click` event is fired with 300ms delay. Since it often frustrates users, the apps should respond quickly to their tap operations.

## Features
- Easy to use
- Small (~1kb, minified and gzipped)
- No Dependency
- In desktop browser it also works. (Do not require awareness of difference between mobile and desktop.)

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

## Usage
*CommonJS:*
```javascript
var silktouch = require('silktouch');

silktouch.on('green', '#block', function () {
    console.log('Creeper!');
});
```

*AMD:*
```javascript
require(['path/to/silktouch'], function (silktouch) {
    silktouch.on('green', '#block', function () {
        console.log('Creeper!');
    });
});
```

*directly:*
```javascript
silktouch.on('green', '#block', function () {
    console.log('Creeper!');
});
```

## API
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

## Supprted browser
Android Browser 4+, Chrome, Firefox, Safari, Opera, Edge and IE9+

## License
MIT


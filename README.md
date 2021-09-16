# JSON is easy

## “Dead-easy JSON serialization for JavaScript. Bidirectional object synchronization with async support„

![ci badge](https://github.com/nopeless/dead-easy-json/actions/workflows/ci.yaml/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/nopeless/dead-easy-json/badge.svg?branch=main)](https://coveralls.io/github/nopeless/dead-easy-json?branch=main)
![Dev badge](https://img.shields.io/badge/Developing%20stage-BETA-ff69b4)

  

[![NPM](https://nodei.co/npm/dead-easy-json.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/dead-easy-json/)

> Until `v2.0.0`, The package is in beta, which means design choices can change

## Quickstart
<!--INJECT ./docs/quickstart.js-->
```js
const Dej = require(`dead-easy-json`)(__dirname);
const { file: myFile } = Dej.require(`./myJson.json`);
// // myFile = {} This is implied. You can override this behavior
// myFile.a.b = 3; // ERROR; because a is undefined
myFile.a = {};  // Ok; written to file system SYNCHRONOUSLY by default
myFile.a.b = 3; // Ok; written to file system SYNCHRONOUSLY by default
/*
The json file will look like this
{
 a: {
  b: 3
 }
}
*/
console.log(myFile.a.b); // 3
console.log(myFile.a.c); // undefined
// console.log(myFile.d.e); // ERROR

```
<!--END ./docs/quickstart.js-->

## A more controlled example
<!--INJECT ./docs/detailed.js-->
```js
const Dej = require(`dead-easy-json`)(); // dirname is optional if you use absolute paths when requiring
const handler = Dej.require(`${__dirname}/myJson.json`, 
  {} //The default object. Can be set to {"ur property":{"values":[]}} or [1,{2:3}] for example.
  , {
  writeInterval: 100, // When this value is set, the object tracks changes and writes those changes at once every interval. Don't worry, it doesn't write when there are no changes. Read # writeInterval section for more

  // Options for JSON.stringify
  replacer: null,
  space: 2,

  // Writes the JSON to the variable asynchronously
  // You must call handler.close() to exit properly
  watch: true
});
const { file: myFile } = handler;

myFile.a = [1,2,3];

console.log(myFile.a); // undefined
// This obviously should be inside an async function
await handler.writeAwait; //  type: ignore
console.log(myFile.a); // [1, 2, 3]

// You can also immediately write the file
handler.write();

// and asynchronously write the file as well
await handler.writeAsync();

// Taking a sub-property object is also supported
myFile[1] = {}
const myObj = myFile[1]
myObj.b = 2 // Written in disk

handler.close(); // MUST if watch: true

```
<!--END ./docs/detailed.js-->

## How `writeInterval` works

The changes are queued for the next `writeInterval` ms and then the callback is called.
This change listener does not check whether the properties are actually the same e.g) setting `a.b = 3` and then setting it to `a.b = 3`. Even though they are two same values, the file will still be written

## Specifications

All the properties of the main `file` proxy is a proxy itself as well
```js
const { file } = require(`dead-easy-json`)().require(``);
file.property = {} // Written in disk
const prop = file.property;
prop.a = 42 // Also written in disk

// This is a no brainer but rewriting the property itself doesn't work
let prop = file.property;
prop = 3 // This just sets prop to a new reference
```

When saving the json file, all references are PRESERVED
```js
const prop = file.property
setTimeout(() => {
  console.log(prop.a) // prints 42; reference is PRESERVED
}, 10000)
// Save the file to be
/*
{
  "property": { "a": 42 }
}
*/
```

When saving the json file, type `{}` should be matched with type `{}` and `[]` with `[]`
```js

file.property = {}
// Save the file to be
/*
{
  "property": []
}
*/
// ^ ERROR because the reference preservation system forbids this
// Also I do NOT see any reason for anyone to use [] and {} interchangably

// Doing
file.property = [] 
// In the code however, is allowed
```

## Some gatchas

- Default objs can be nested, but they are written in sync regardless of `writeInterval`.

 - Even if there is a `writeInterval` the variable is immediately accessible. Its just written in memory before disk

 - The reader will rewrite the file when initially loaded if it is a blank file ex) `""`. If it is a blank, the file be `defaultObj` or `{}` apon constructing the proxy. This is done SYNCHRONOUSLY

 - Setting the `.file` to a new object will invoke another proxy. This will ALWAYS rewrite the file synchronously (note: this was an elaborate design choice ) (must be like `myObj.file = {}` not `file = {}` <- this will not invoke the new proxy)

 - Watch writes to the json variable. This will not reset the write timer

 - Because the reference is preserved, `myArray[3]` for example will point to the `[3]` when the file changes. If you do not want this behavior, do something like `const val = myArray[3]` then only use val.

## Donations
If this project helped you save time developing prototypes, consider donating 😄

<a href='https://ko-fi.com/nopeless' target='_blank'><img height='35' style='border:0px;height:46px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' alt='Buy Me a Coffee at ko-fi.com' />  
<a href="https://www.buymeacoffee.com/nopeless"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>

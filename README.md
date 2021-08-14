# JSON is easy

The goal is to make a plug-and-play type of package that is used for small projects

## Quickstart
```js
const Dej = require('dead-easy-json');
const { file: myFile } = Dej.require('./yourjsonfile');
myFile.a.b = 3; // ERROR
// myFile = {} This is implied! You can override this behavior in config
myFile.a = {};  // ok; written to file system SYNCHRONOUSLY by default
myFile.a.b = 3; // ok; written to file system SYNCHRONOUSLY by default
/*
{
	a: {
		b: 3
	}
}
*/
console.log(myFile.a.b); // 3
console.log(myFile.a.c); // undefined
console.log(myFile.d.e); // ERROR
```

## A more controlled example
```js
const Dej = require('dead-easy-json');
const { file: myFile, config, write, writeAsync } = Dej.require('./yourjsonfile');
config.defaultObject = {}; // Overrides default object to load. Might wanna use {} or []
config.writeInterval = 1000; // When this value is set, the object tracks changes and writes those changes at once every interval 
// write() // This invokes the synchronous write() function
// await writeAsync() // This invokes the write() function as a Promise
```

## Donations
Has this project reduced 20 minutes of your dev time?  
Consider donating me $3 so I can feel better about making bloated packages

https://ko-fi.com/nopeless


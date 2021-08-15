# JSON is easy

![ci badge](https://github.com/nopeless/dead-easy-json/actions/workflows/ci.yaml/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/nopeless/dead-easy-json/badge.svg?branch=main)](https://coveralls.io/github/nopeless/dead-easy-json?branch=main)

The goal is to make a plug-and-play type of package that is used for small projects

## Quickstart
```js
const Dej = new require('dead-easy-json')(__dirname);
const { file: myFile } = Dej.require('./yourjsonfile');
myFile.a.b = 3; // ERROR
// myFile = {} This is implied! You can override this behavior in config
myFile.a = {};  // Ok; written to file system SYNCHRONOUSLY by default
myFile.a.b = 3; // Ok; written to file system SYNCHRONOUSLY by default
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
const Dej = new require('dead-easy-json')(__dirname); // There are "hacky" ways to get the caller file but I'm not risking it
const { file: myFile, write, writeAsync } = Dej.require('./yourjsonfile', {}, {
	writeInterval = 1000; // When this value is set, the object tracks changes and writes those changes at once every interval. Don't worry, it doesn't write when there are no changes. Read # writeInterval section for more
	
	// Options for JSON.stringify
	replacer: null,
	space: 2,
});
// The config is accessible by .config if you really need to edit it

// write() // This invokes the synchronous write() function
// await writeAsync() // This invokes the write() function as a Promise
```

## How `writeInterval` works

```
set() is called
if a previous timeout is present:
 modifiy the object and return the write callback
else:
 a timeout is made with callback:
  call write
```

## Some gatchas

- Default objs can be nested, but they are written in sync regardless of `writeInterval`.

 - The presense of `writeInterval` determines which type of proxy is returned. Therefore, if you want to use a writeInterval, set it to a defined value (like 0). Defaults to null

 - Even if there is a `writeInterval` the variable is immediately accessible. Its just written in memory before disk

 - The reader will rewrite the file when initially loaded if it was an invalid read ex) ``. For example, a blank file will be {} apon constructing the object. This is done SYNCHRONOUSLY

 - Setting the `.file` to a new object will invoke another proxy. This will ALWAYS rewrite the file synchronously (note: this was a design choice because it just feels weird) (must be like `myObj.file = {}` not `file = {}` <- this will not invoke the new proxy)

## Donations
Has this project reduced 20 minutes of your dev time?  
Consider donating me $3 so I can feel better about making bloated packages

https://ko-fi.com/nopeless


const myFile = require(`dead-easy-json`)(`./myJson.json`).file;
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

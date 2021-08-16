const Dej = require(`dead-easy-json`)(); // dirname is optional if you use absolute paths when requiring
const handler = Dej.require(`${__dirname}/myJson.json`, {}, {
  writeInterval: 100, // When this value is set, the object tracks changes and writes those changes at once every interval. Don't worry, it doesn't write when there are no changes. Read # writeInterval section for more

  // Options for JSON.stringify
  replacer: null,
  space: 2,
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

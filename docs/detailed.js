const Dej = new require(`dead-easy-json`)(__dirname); // There are "hacky" ways to get the caller file but I'm not risking it
const { file: myFile, writeAwait } = Dej.require(`./myJson.json`, {}, {
  writeInterval: 100, // When this value is set, the object tracks changes and writes those changes at once every interval. Don't worry, it doesn't write when there are no changes. Read # writeInterval section for more

  // Options for JSON.stringify
  replacer: null,
  space: 2,
});
// The config is accessible by .config if you really need to edit it

// write() // This invokes the synchronous write() function
// await writeAsync() // This invokes the write() function as a Promise
myFile.a = [1,2,3];

console.log(myFile.a); // undefined
// This obviously should be inside an async function
await writeAwait; //  type: ignore
console.log(myFile.a); // [1, 2, 3]


const readline = require(`readline`);
const handler = require(`../src/index.js`)(`./file.json`, [], {
  watch: true
});
const file = handler.file;

handler.watchCallback = () => console.log(`detected file change`);

const ask = q => new Promise(resolve => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(q, (answer) => {
    resolve(answer);
    rl.close();
  });
});

(async () => {
  console.log(`Make sure you have \`file.json\` open on your editor\n` +
  `Commands:\n` +
  `  add <n> - adds number n to all elements\n` +
  `  append <n> - push(n)\n` +
  `  query - queries a value in the json file\n` +
  `  animate - shows an animation` +
  `  quit - quits the repl\n`);
  for (;;) {
    const line = await ask(`> `);
    const [command, ...args] = line.split(/\s+/);
    switch (command) {
    case `add`: {
      const n = Number(args[0]);
      if (Number.isNaN(n)) {
        console.error(`Not a number: ${n}`);
        break;
      }
      for (const index in file) {
        file[index] += n;
      }
      console.log(`Added ${n} to all elements`);
      break;
    }
    case `append`: {
      const n = Number(args[0]);
      if (Number.isNaN(n)) {
        console.error(`Not a number: ${n}`);
        break;
      }
      file.push(n);
      console.log(`Appended ${n} to the array`);
      break;
    }
    case `animate`: {
      let temp;
      for (const index in file) {
        temp = file[index];
        file[index] = `WOOSH`;
        await new Promise(resolve => setTimeout(resolve, 500));
        file[index] = temp;
      }
      console.log(`done animating`);
      break;
    }
    case `query`: {
      let temp = file;
      for (const arg of args) {
        temp = temp[arg];
      }
      console.log(`The value of file.${args.map(v => `[${v}]`).join(``)} is ${temp}`);
      break;
    }
    case `quit`:
      console.log(`Bye!`);
      return;
    default:
      console.error(`Unknown command: ${command}`);
    }
  }
})().then(() => process.exit(0));
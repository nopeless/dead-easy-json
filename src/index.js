'use strict';
const path = require(`path`);
const fs = require(`fs`);
const isSerializable = require(`./util/isSerializable`);
class ProxyJson {
  /**
   * The no-interval version
   *
   * @param {string} dir
   * @param {Object} defaultObj
   * @param {Object} config
   */
  constructor(dir, defaultObj = {}, config = {}) {
    const str = fs.readFileSync(dir).toString();
    let rewrite = false;
    if (str !== ``) defaultObj = JSON.parse(str);
    else rewrite = true;
    this.dir = dir;

    this.config = {
      replacer: null,
      space: 2,
      ...config
    };
    this.defaultObj = defaultObj;
    // eslint-disable-next-line no-unused-vars
    const thenWrite = (ret, ...args) => {
      this.write();
      return ret;
    };
    const m = this;
    const handler = {
      // I decided to keep this interface primitive
      // TODO: deal with test coverage
      apply: function(...args) {
        throw new Error(`Not supported. Arguments: ${args}`);
        // return Reflect.apply(this, this.target, args);
      },
      // This function is fundamentally uncallable
      // construct: function(...args) {
      //   return new Error(`Not supporetd. Arguments: ${args}`);
      //   // return Reflect.construct(this, this.target, args);
      // },
      defineProperty: function(...args) {
        throw new Error(`Use '=' instead. Arguments: ${args}`);
        // return Reflect.defineProperty(this, this.target, args);
      },
      deleteProperty: function(target, property) {
        return thenWrite(Reflect.deleteProperty(target, property));
      },
      get: function(target, property) {
        return target[property];
      },
      getOwnPropertyDescriptor: function(target, property) {
        return Reflect.getOwnPropertyDescriptor(target, property);
      },
      getPrototypeOf: function(target) {
        return Reflect.getPrototypeOf(target);
      },
      has: function(target, property) {
        return Reflect.has(target, property);
      },
      isExtensible: function(target) {
        return Reflect.isExtensible(target);
      },
      ownKeys: function(target) {
        return Reflect.ownKeys(target);
      },
      // eslint-disable-next-line no-unused-vars
      preventExtensions: function(target, property) {
        return Reflect.preventExtensions(target, property);
      },
      set: function(target, property, value) {
        if (!isSerializable(value)) {
          throw new Error(`Not supported. Got type [${typeof value}]`);
        }
        function recursiveAssign(target, property, value) {
          // console.log(`Recursive assign ${property}:${value}`, value);
          if (!(typeof value === `object` && value !== null)) {
            return Reflect.set(target, property, value);
          }
          const res = Reflect.set(target, property, new Proxy(value, handler));
          for (const k of Object.keys(value)) {
            // console.log(k);
            recursiveAssign(value, k, value[k]);
          }
          return res;
        }
        // const res = Reflect.set(target, property, value.constructor(),
        //   (() => {
        //     for (const [k, v] of Object.entries(value)) {
        //       value.
        //     }
        //   })()
        // ));
        const res = recursiveAssign(target, property, value);
        m.write();
        return res;
      },
      setPrototypeOf: function(...args) {
        throw new Error(`Not supported. Arguments: ${args}`);
        // return Reflect.setPrototypeOf(this, this.target, args);
      },
    };
    this.handler = handler;

    if (Array.isArray(defaultObj)) {
      this.internalSave = [...defaultObj];
    } else {
      this.internalSave = {
        ...defaultObj
      };
    }
    this.file = this.internalSave;
    if (rewrite) this.write();
  }
  get file() {
    return this._file;
  }
  set file(val) {
    if (Array.isArray(val)) {
      this.internalSave = [...val];
    } else {
      this.internalSave = {
        ...val
      };
    }
    this._file = new Proxy(this.internalSave, this.handler);
    this.write();
  }
  // get file() {
  //   if (!this._file) {
  //     this._file = this.config.defaultObject;

  //   }
  //   return this._file;
  // }
  /**
   * Void
   */
  write() {
    fs.writeFileSync(this.dir, JSON.stringify(this.file, this.config.replacer, this.config.space));
  }
  /**
   * Void
   */
  async writeAsync() {
    return new Promise((resolve, reject) => {
      try {
        this.write();
      }
      catch (e) {
        reject(e);
      }
      resolve();
    });
  }
}
const DeadEasyJson = function(dirname = undefined) {
  return { require: (file, defaultObj, config = {}) => {
    if (!path.isAbsolute(file)) {
      if (dirname === undefined) {
        throw new Error(`Cannot require ${file} without a directory (make sure you passed __dirname to the constructor)`);
      }
    }
    if (config.writeInterval) {
      throw Error(`NotImplementedError: yeah I didn't write this yet`);
    }
    return new ProxyJson(path.join(dirname, file), defaultObj, config);
  }
  };
};
DeadEasyJson.require = () => {throw new Error(`You forgot to add (__dirname)`);};

if (false) {
  const Dej = DeadEasyJson(__dirname);
  const d = Dej.require(`test.json`);
  let {file:myFile, config} = d;
  config.defaultObject = [];
  // console.log(myFile.a);
  // myFile.a = {b:{c:1}};
  // // myFile.b = {};
  // myFile.a.b.c=2;
  // console.log(myFile.a);
  d.file = [];
  myFile = d.file;
  console.log(myFile);
  myFile.push([]);
  myFile[0].push(1);
  console.log(JSON.stringify(myFile, null, 2));
  // setTimeout(async() => {
  //   myFile.arr = [];
  //   // loop 100 times
  //   for (let i = 0; i < 100; i++) {
  //     console.log(i);
  //     myFile.arr.push(i);
  //     await new Promise(r => setTimeout(r, 1000));
  //   }
  // }, 1000);
}


// Return an instance
module.exports = DeadEasyJson;


'use strict';
const path = require(`path`);
const fs = require(`fs`);
const isSerializable = require(`./util/isSerializable`);
const overwriteObject = require(`./util/overwriteObject`);
const chokidar = require(`chokidar`);
class ProxyJson {
  /**
   * The no-interval version
   *
   * @param {string} dir
   * @param {Object} defaultObj
   * @param {Object} config
   */
  constructor(dir, defaultObj = undefined, config) {
    const str = fs.readFileSync(dir).toString();
    let rewrite = false;
    if (str !== ``) {
      const o = JSON.parse(str);
      if (defaultObj !== undefined) {
        if (typeof defaultObj === `object` && typeof o === `object`) {
          if (defaultObj.constructor !== o.constructor) {
            throw new Error(`The type stored in json does not match the default object type`);
          }
        } else {
          throw new Error(`The type of both defaultObj and json should be an object`);
        }
      }
      defaultObj = o;
    }
    if (defaultObj === undefined) {
      defaultObj = {};
    }
    else rewrite = true;
    this.dir = dir;
    this.writing = false;
    this.config = {
      replacer: null,
      space: 2,
      writeInterval: null,
      watch: false,
    };
    for (const k of Object.keys(config)) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.config.hasOwnProperty(k)) {
        this.config[k] = config[k];
      } else {
        throw new Error(`Unrecognized option ${k} with value ${config[k]}`);
      }
    }
    this.defaultObj = defaultObj;
    // eslint-disable-next-line no-unused-vars
    const thenWrite = (ret, ...args) => {
      this.scheduleWrite();
      return ret;
    };
    const m = this;
    const handler = {
      // I decided to keep this interface primitive
      // These function is fundamentally uncallable
      // apply: function(...args) {
      //   throw new Error(`Not supported. Arguments: ${args}`);
      //   // return Reflect.apply(this, this.target, args);
      // },
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
          // Add helpful checks to see if target is Object or Array

          if (Array.isArray(target)) {
            if (!property.match(/^0|[1-9]\d*|length$/)) {
              throw new Error(`Not supported. Array index must be an non-negative integer with no leading 0s. Got [${property}]`);
            }
          }
          if (!(typeof value === `object` && value !== null)) {
            return Reflect.set(target, property, value);
          }
          const res = Reflect.set(target, property, new Proxy(value, handler));
          for (const k of Object.keys(value)) {
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
        m.scheduleWrite();
        return res;
      },
      setPrototypeOf: function(...args) {
        throw new Error(`Not supported. Arguments: ${args}`);
        // return Reflect.setPrototypeOf(this, this.target, args);
      },
    };
    this.handler = handler;

    // Is array or an object because of the check above
    if (Array.isArray(defaultObj)) {
      this.internalSave = [...defaultObj];
    } else {
      this.internalSave = {
        ...defaultObj
      };
    }
    this.file = this.internalSave;
    if (rewrite) this.write();
    this._resetWrite();

    this.onFileSaveError = console.error;

    function getJson() {
      let content;
      try {
        content = fs.readFileSync(dir).toString();
        return JSON.parse(content);
      } catch (e) {
        if (e.__proto__.name===`SyntaxError`) {
          throw new Error(`The JSON file you saved is invalid! Discarding changes. content=${content}`);
        }
        throw e;
      }
    }
    if (this.config.watch) {
      // Spawn a watcher
      this.watchCallback = () => {};
      const watcher = chokidar.watch(this.dir);
      watcher.on(`change`, (_, stats) => {
        console.log(1);
        if (this.writing) return;
        console.log(2, stats.mtimeMs - this.lastWrite);
        // Sync check
        // if (stats.mtimeMs - this.lastWrite < 1) return;
        console.log(3);

        this._resetWrite();
        try {
          overwriteObject(this.file, getJson());
        } catch (e) {
          this.onFileSaveError(e);
        }
        console.log(`called`);
        this.watchCallback();
      });
      this.close = () => watcher.close();
    } else {
      this.close = () => {};
    }
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
    this._file = new Proxy(this.internalSave.constructor(), this.handler);
    for (const key of Object.keys(this.internalSave)) {
      this._file[key] = this.internalSave[key];
    }
    this.write();
  }
  get writeAwait() {
    return this.config.writeInterval ? (this.writeTimer ? this._writeAwait : Promise.resolve()) : Promise.reject(new Error(`Awaited a write when writeInterval was not set`));
  }
  scheduleWrite() {
    if (this.config.writeInterval) {
      if (this.writeTimer) {
        return this.writeAwait; // Don't do anything
      }
      return this._writeAwait = new Promise(resolve => {
        this.writeTimer = setTimeout(
          () => {this.writeTimer = null; this.write(); resolve();},
          this.config.writeInterval
        );}
      );
    }
    this.write();
  }
  _resetWrite() {
    this.lastWrite = Date.now();
    clearTimeout(this.writeTimer);
    this.writeTimer = null;
  }
  /**
   * Void
   */
  write() {
    fs.writeFileSync(this.dir, JSON.stringify(this.file, this.config.replacer, this.config.space));
    this._resetWrite();
  }
  /**
   * Void
   */
  async writeAsync() {
    return new Promise((resolve, reject) => {
      try {
        this._resetWrite();
        this.writing = true;
        fs.promises.writeFile(this.dir, JSON.stringify(this.file, this.config.replacer, this.config.space))
          .then(resolve)
          .finally(() => {
            this.writing = false;
          });
      }
      catch (e) {
        /* istanbul ignore next */
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
      return new ProxyJson(path.join(dirname, file), defaultObj, config);
    }
    return new ProxyJson(file, defaultObj, config);
  }
  };
};
DeadEasyJson.require = () => {throw new Error(`You forgot to add (__dirname)`);};

// Return an instance
module.exports = DeadEasyJson;


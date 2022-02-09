class Util {
  static ms(val: string | number, options?: { long: boolean }) {
    const s = 1000;
    const m = s * 60;
    const h = m * 60;
    const d = h * 24;
    const w = d * 7;
    const y = d * 365.25;

    const parse = (str) => {
      str = String(str);
      if (str.length > 100) return;
      const match = /^(-?(?:\d+)?\.?\d+) *(ms|s|m|h|d|w|y)?$/i.exec(str);
      if (!match) return;
      const n = parseFloat(match[1]);
      const type = (match[2] || 'ms').toLowerCase();
      switch (type) {
        case 'y':
          return n * y;
        case 'w':
          return n * w;
        case 'd':
          return n * d;
        case 'h':
          return n * h;
        case 'm':
          return n * m;
        case 's':
          return n * s;
        case 'ms':
          return n;
        default:
          return undefined;
      }
    };

    const fmtLong = (ms) => {
      const msAbs = Math.abs(ms);
      if (msAbs >= d) return plural(ms, msAbs, d, 'ngày');
      if (msAbs >= h) return plural(ms, msAbs, h, 'giờ');
      if (msAbs >= m) return plural(ms, msAbs, m, 'phút');
      if (msAbs >= s) return plural(ms, msAbs, s, 'giây');
      return ms + ' ms';
    };

    const fmtShort = (ms) => {
      const msAbs = Math.abs(ms);
      if (msAbs >= d) return Math.round(ms / d) + 'd';
      if (msAbs >= h) return Math.round(ms / h) + 'h';
      if (msAbs >= m) return Math.round(ms / m) + 'm';
      if (msAbs >= s) return Math.round(ms / s) + 's';
      return ms + 'ms';
    };

    const plural = (ms, msAbs, n, name) => {
      return Math.round(ms / n) + ' ' + name;
    };

    const type = typeof val;
    if (type === 'string') return parse(val);
    else if (type === 'number')
      return options && options.long ? fmtLong(val) : fmtShort(val);
  }

  static omit(value, key: string[]) {
    if (!value || typeof value != 'object') {
      return value;
    }

    const omitObject = (value, key: string[]) => {
      const clone = JSON.parse(JSON.stringify(value));
      const keys = Object.keys(clone);

      // Todo: Delete key on key input
      for (let k = 0; k <= key.length; k++) {
        for (let e = 0; e <= keys.length; e++) {
          if (keys[e] == key[k]) {
            delete clone[keys[e]];
          }
        }
      }
      return clone;
    };

    if (Array.isArray(value)) {
      const result = [];
      value.map((element) => result.push(omitObject(element, key)));
      return result;
    } else {
      return omitObject(value, key);
    }
  }
}

export default Util;

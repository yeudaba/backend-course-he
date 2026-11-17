function trace(fn, name, log) {
  return (arg) => {
    log.push(`→ ${name}(${JSON.stringify(arg)})`);
    try {
      const result = fn(arg);
      log.push(`← ${name} = ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      log.push(`✘ ${name}: ${err.message}`);
      throw err;
    }
  };
}

const log = [];
const parse = trace((text) => JSON.parse(text), "parse", log);
parse('{"a":1}');
try {
  parse("{bad");
} catch (err) {
  log.push(`נתפס בחוץ: ${err.name}`);
}
console.log(log);

module.exports = { trace };

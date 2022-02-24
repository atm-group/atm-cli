const log = (str) => {
  console.log('\x1B[32m%s\x1B[0m', str);
}

const warn = (str) => {
  console.log('\x1B[31m%s\x1B[0m', str);
}

module.exports = {
  warn,
  log,
}
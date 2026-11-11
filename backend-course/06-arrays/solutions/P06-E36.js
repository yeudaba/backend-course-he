function nextOnDuty(rota) {
  if (rota.length === 0) {
    return null;
  }
  const person = rota.shift();
  rota.push(person);
  return person;
}

const rota = ["דנה", "עומר", "נועה"];
console.log(nextOnDuty(rota), nextOnDuty(rota), rota);

module.exports = { nextOnDuty };

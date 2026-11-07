// P08-E25: מחשבון בלי eval
const OPERATORS = ["+", "-", "*", "/"];

function tokenize(expression) {
  const tokens = [];
  let current = "";
  const flush = () => {
    if (current !== "") {
      const n = Number(current);
      if (Number.isNaN(n)) throw new Error("ביטוי לא תקין");
      tokens.push(n);
      current = "";
    }
  };
  for (const ch of expression) {
    if ("0123456789.".includes(ch)) {
      current += ch;
    } else if (OPERATORS.includes(ch)) {
      flush();
      tokens.push(ch);
    } else if (ch === " ") {
      flush();
    } else {
      throw new Error(`תו לא חוקי: ${ch}`);
    }
  }
  flush();
  return tokens;
}

function validate(tokens) {
  const ok =
    tokens.length % 2 === 1 &&
    tokens.every((t, i) => (i % 2 === 0 ? typeof t === "number" : OPERATORS.includes(t)));
  if (!ok) throw new Error("ביטוי לא תקין");
}

function calculate(expression) {
  const tokens = tokenize(expression);
  validate(tokens);

  const stack = [tokens[0]];
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    const n = tokens[i + 1];
    if (op === "*") {
      stack.push(stack.pop() * n);
    } else if (op === "/") {
      if (n === 0) throw new Error("חילוק באפס");
      stack.push(stack.pop() / n);
    } else {
      stack.push(op, n);
    }
  }

  let result = stack[0];
  for (let i = 1; i < stack.length; i += 2) {
    result = stack[i] === "+" ? result + stack[i + 1] : result - stack[i + 1];
  }
  return result;
}

console.log(calculate("2 + 3 * 4"), calculate("10 / 4 - 1"), calculate("7"));
for (const bad of ["2 + x", "3 +", "4 / 0"]) {
  try {
    calculate(bad);
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = { calculate, tokenize };

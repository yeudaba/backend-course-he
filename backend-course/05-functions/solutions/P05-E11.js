// P05-E11: ארבע arrow functions
const square = (n) => n * n;
const isPositive = (n) => n > 0;
const greet = (name) => `שלום, ${name}!`;
const maxOfTwo = (a, b) => (a > b ? a : b);

console.log(square(7), isPositive(-1), greet("דנה"), maxOfTwo(3, 8));

module.exports = { square, isPositive, greet, maxOfTwo };

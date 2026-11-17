const unitPrice = 12.5;
const maxQty = 5;
for (let qty = 1; qty <= maxQty; qty++) {
  console.log(`${qty} × ${unitPrice} = ${(qty * unitPrice).toFixed(2)}`);
}

// P27-E94: SQL injection — tagged template שמייצר פרמטרים
export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  const params: unknown[] = [];
  let text = strings[0];
  values.forEach((v, i) => {
    if (Array.isArray(v)) {

      text += v.map((x) => (params.push(x), `$${params.length}`)).join(", ");
    } else {
      params.push(v);
      text += `$${params.length}`;
    }
    text += strings[i + 1];
  });
  return { text, values: params };
}

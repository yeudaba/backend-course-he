// עוזר לבדיקות של שאלות התרגול ביחידה 15.5: קורא קובצי HTML ו־CSS שכתבת, ובונה "דפדפן" קטן ומזויף
// (document עם createElement, querySelector ואירועים) כדי לבדוק קוד שעובד עם ה־DOM — בלי דפדפן אמיתי.
// לא צריך להבין את הקובץ הזה עכשיו — נלמד על בדיקות בפרק 22.
import fs from "node:fs";
import { target } from "../../tools/load.mjs";

export function readStarter(testUrl, file) {
  const p = target(testUrl, file);
  if (!fs.existsSync(p)) throw new Error(`לא מצאתי את הקובץ ${file} בתיקיית starter. האם הוא נמחק או שונה שמו?`);
  return fs.readFileSync(p, "utf8");
}

// ---------- HTML ----------
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW = new Set(["script", "style", "textarea", "title"]);
// תגית שנפתחת סוגרת לבד תגית פתוחה מאותו סוג (כמו בדפדפן): <li>א<li>ב
const AUTO_CLOSE = { li: ["li"], option: ["option"], p: ["p"], tr: ["tr", "td", "th"], td: ["td", "th"], th: ["td", "th"] };

function decode(text) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function parseAttrs(src) {
  const attrs = {};
  for (const m of src.matchAll(/([^\s=\/"'>]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g)) {
    const v = m[2] === undefined ? "" : m[2].replace(/^["']|["']$/g, "");
    attrs[m[1].toLowerCase()] = decode(v);
  }
  return attrs;
}

// מחזיר שורש: { tag: "#root", children, doctype }
export function parseHtml(text) {
  const root = { tag: "#root", attrs: {}, children: [], parent: null };
  root.doctype = /^\s*(<!--[\s\S]*?-->\s*)*<!doctype html>/i.test(text);
  const src = text.replace(/<!--[\s\S]*?-->/g, "").replace(/<!doctype[^>]*>/i, "");
  const stack = [root];
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>|([^<]+)/g;
  let m;
  while ((m = re.exec(src))) {
    const top = stack[stack.length - 1];
    if (m[4] !== undefined) {
      top.children.push({ text: decode(m[4]), parent: top });
      continue;
    }
    const tag = m[2].toLowerCase();
    if (m[1]) {
      const i = stack.map((n) => n.tag).lastIndexOf(tag);
      if (i > 0) stack.length = i;
      continue;
    }
    const closes = AUTO_CLOSE[tag];
    if (closes && closes.includes(top.tag)) stack.pop();
    const parent = stack[stack.length - 1];
    const el = { tag, attrs: parseAttrs(m[3]), children: [], parent };
    parent.children.push(el);
    if (RAW.has(tag)) {
      const end = src.toLowerCase().indexOf(`</${tag}`, re.lastIndex);
      const stop = end === -1 ? src.length : end;
      const raw = src.slice(re.lastIndex, stop);
      if (raw) el.children.push({ text: tag === "script" || tag === "style" ? raw : decode(raw), parent: el });
      re.lastIndex = end === -1 ? src.length : src.indexOf(">", end) + 1;
      continue;
    }
    if (!VOID.has(tag) && !m[3].trim().endsWith("/")) stack.push(el);
  }
  return root;
}

export const elementsOf = (node) => node.children.filter((c) => c.tag);
export function textOf(node) {
  if (node.text !== undefined) return node.text;
  return node.children.map(textOf).join("");
}
export const cleanText = (node) => textOf(node).replace(/\s+/g, " ").trim();

// selector: tag#id.class[attr][attr=value], עם רווח (צאצא), > (ילד ישיר) ו־, (כמה)
function parseCompound(s) {
  const c = { tag: null, id: null, classes: [], attrs: [] };
  const re = /^([a-zA-Z][\w-]*|\*)|#([\w-]+)|\.([\w-]+)|\[([\w-]+)(?:=["']?([^\]"']*)["']?)?\]/g;
  let m;
  while ((m = re.exec(s))) {
    if (m[0] === "") break;
    if (m[1]) c.tag = m[1] === "*" ? null : m[1].toLowerCase();
    else if (m[2]) c.id = m[2];
    else if (m[3]) c.classes.push(m[3]);
    else if (m[4]) c.attrs.push([m[4].toLowerCase(), m[5]]);
  }
  return c;
}
function matchCompound(el, c, get) {
  if (!el.tag || el.tag === "#root") return false;
  if (c.tag && el.tag !== c.tag) return false;
  if (c.id && get(el, "id") !== c.id) return false;
  const cls = (get(el, "class") ?? "").split(/\s+/);
  if (!c.classes.every((x) => cls.includes(x))) return false;
  return c.attrs.every(([k, v]) => (v === undefined ? get(el, k) !== undefined : get(el, k) === v));
}
function matchSelector(el, selector, get) {
  return selector.split(",").some((one) => {
    const parts = one.trim().replace(/\s*>\s*/g, " > ").split(/\s+/);
    const steps = [];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === ">") continue;
      steps.push({ comp: parseCompound(parts[i]), child: parts[i - 1] === ">" });
    }
    const walk = (node, k) => {
      if (!matchCompound(node, steps[k].comp, get)) return false;
      if (k === 0) return true;
      if (steps[k].child) return node.parent ? walk(node.parent, k - 1) : false;
      for (let p = node.parent; p; p = p.parent) if (walk(p, k - 1)) return true;
      return false;
    };
    return walk(el, steps.length - 1);
  });
}
const getParsed = (el, k) => el.attrs?.[k];
function all(node, out = []) {
  for (const c of node.children ?? []) {
    if (c.tag) {
      out.push(c);
      all(c, out);
    }
  }
  return out;
}
export const qsa = (root, selector) => all(root).filter((el) => matchSelector(el, selector, getParsed));
export const qs = (root, selector) => qsa(root, selector)[0] ?? null;

// ---------- CSS ----------
// מחזיר [{ selectors: [...], decls: { prop: value } }] — בלי הערות, @media נפתח לכללים רגילים
export function parseCss(text) {
  const rules = [];
  const src = text.replace(/\/\*[\s\S]*?\*\//g, "");
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(src))) {
    let sel = m[1].trim();
    if (sel.startsWith("@")) continue;
    sel = sel.replace(/^@[^{]*\{/, "").trim();
    const decls = {};
    for (const d of m[2].split(";")) {
      const i = d.indexOf(":");
      if (i === -1) continue;
      decls[d.slice(0, i).trim().toLowerCase()] = d.slice(i + 1).trim().replace(/\s+/g, " ");
    }
    rules.push({ selectors: sel.split(",").map((s) => s.trim().replace(/\s+/g, " ")), decls });
  }
  return rules;
}
// כל ההצהרות של selector מסוים (במדויק), מאוחדות לפי הסדר
export function declsFor(rules, selector) {
  const want = selector.trim().replace(/\s+/g, " ");
  const out = {};
  for (const r of rules) if (r.selectors.includes(want)) Object.assign(out, r.decls);
  return out;
}

// ---------- DOM מזויף ----------
class FakeClassList {
  constructor(el) {
    this.el = el;
  }
  #list() {
    return (this.el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
  }
  #set(list) {
    this.el.setAttribute("class", list.join(" "));
  }
  add(...names) {
    this.#set([...new Set([...this.#list(), ...names])]);
  }
  remove(...names) {
    this.#set(this.#list().filter((n) => !names.includes(n)));
  }
  contains(name) {
    return this.#list().includes(name);
  }
  toggle(name, force) {
    const on = force ?? !this.contains(name);
    on ? this.add(name) : this.remove(name);
    return on;
  }
  get length() {
    return this.#list().length;
  }
  toString() {
    return this.#list().join(" ");
  }
}

export class FakeElement {
  constructor(doc, tag) {
    this.ownerDocument = doc;
    this.tag = tag.toLowerCase();
    this.attrs = {};
    this.children = [];
    this.parent = null;
    this.listeners = {};
    this.value = "";
    this.checked = false;
    this.disabled = false;
    this.hidden = false;
    this.innerHTMLUsed = false;
    this.classList = new FakeClassList(this);
    this.dataset = new Proxy({}, {
      get: (t, k) => this.attrs[`data-${String(k).replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}`],
      set: (t, k, v) => {
        this.attrs[`data-${String(k).replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}`] = String(v);
        return true;
      },
    });
  }
  get tagName() {
    return this.tag.toUpperCase();
  }
  get parentElement() {
    return this.parent && this.parent.tag !== "#document" ? this.parent : null;
  }
  getAttribute(k) {
    return this.attrs[k.toLowerCase()] ?? null;
  }
  setAttribute(k, v) {
    this.attrs[k.toLowerCase()] = String(v);
  }
  hasAttribute(k) {
    return k.toLowerCase() in this.attrs;
  }
  removeAttribute(k) {
    delete this.attrs[k.toLowerCase()];
  }
  get id() {
    return this.getAttribute("id") ?? "";
  }
  set id(v) {
    this.setAttribute("id", v);
  }
  get className() {
    return this.getAttribute("class") ?? "";
  }
  set className(v) {
    this.setAttribute("class", v);
  }
  get textContent() {
    return this.children.map((c) => (typeof c === "string" ? c : c.textContent)).join("");
  }
  set textContent(v) {
    for (const c of this.children) if (typeof c !== "string") c.parent = null;
    this.children = v === "" || v == null ? [] : [String(v)];
  }
  get innerHTML() {
    return this.textContent;
  }
  set innerHTML(v) {
    // מותר רק לרוקן; כל HTML אחר — נרשם (הבדיקות אוסרות innerHTML עם נתונים)
    if (v !== "") this.innerHTMLUsed = true;
    this.textContent = "";
  }
  #adopt(nodes) {
    return nodes.map((n) => {
      if (typeof n === "string") return n;
      if (n.parent) n.remove();
      n.parent = this;
      return n;
    });
  }
  append(...nodes) {
    this.children.push(...this.#adopt(nodes));
  }
  appendChild(node) {
    this.append(node);
    return node;
  }
  prepend(...nodes) {
    this.children.unshift(...this.#adopt(nodes));
  }
  replaceChildren(...nodes) {
    this.textContent = "";
    this.append(...nodes);
  }
  remove() {
    if (this.parent) this.parent.children = this.parent.children.filter((c) => c !== this);
    this.parent = null;
  }
  get elementChildren() {
    return this.children.filter((c) => typeof c !== "string");
  }
  matches(selector) {
    return matchSelector(this, selector, (el, k) => (k === "class" ? el.getAttribute("class") ?? undefined : el.getAttribute(k) ?? undefined));
  }
  querySelectorAll(selector) {
    const out = [];
    const walk = (el) => {
      for (const c of el.elementChildren) {
        if (c.matches(selector)) out.push(c);
        walk(c);
      }
    };
    walk(this);
    return out;
  }
  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }
  closest(selector) {
    for (let el = this; el && el.tag !== "#document"; el = el.parent) if (el.matches(selector)) return el;
    return null;
  }
  addEventListener(type, fn) {
    (this.listeners[type] ??= []).push(fn);
  }
  removeEventListener(type, fn) {
    this.listeners[type] = (this.listeners[type] ?? []).filter((f) => f !== fn);
  }
}

class FakeDocument extends FakeElement {
  constructor() {
    super(null, "#document");
    this.ownerDocument = this;
  }
  createElement(tag) {
    return new FakeElement(this, tag);
  }
  get body() {
    return this.querySelector("body") ?? this;
  }
}

// document מזויף. html (לא חובה) — תוכן התחלתי, כמו הדף שהקוד שלך רץ בו
export function fakeDocument(html = "") {
  const doc = new FakeDocument();
  const build = (node, parent) => {
    for (const c of node.children) {
      if (c.tag) {
        const el = doc.createElement(c.tag);
        Object.assign(el.attrs, c.attrs);
        if ("value" in c.attrs) el.value = c.attrs.value;
        el.checked = "checked" in c.attrs;
        el.disabled = "disabled" in c.attrs;
        el.hidden = "hidden" in c.attrs;
        parent.append(el);
        build(c, el);
      } else if (c.text.trim() !== "") parent.append(c.text);
    }
  };
  build(parseHtml(html), doc);
  return doc;
}

// אירוע שמבעבע מהאלמנט למעלה, כמו בדפדפן. מחזיר את האירוע (אפשר לבדוק defaultPrevented)
export async function fire(el, type, extra = {}) {
  const event = {
    type,
    target: el,
    currentTarget: null,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopped: false,
    stopPropagation() {
      this.stopped = true;
    },
    ...extra,
  };
  const results = [];
  for (let node = el; node && !event.stopped; node = node.parent) {
    event.currentTarget = node;
    for (const fn of node.listeners?.[type] ?? []) results.push(fn.call(node, event));
  }
  await Promise.all(results.map((r) => Promise.resolve(r).catch(() => {})));
  await new Promise((r) => setTimeout(r, 0));
  return event;
}

// כל האלמנטים בעץ שבהם הוצב innerHTML עם תוכן
export function usedInnerHTML(root) {
  const walk = (el) => el.innerHTMLUsed || el.elementChildren.some(walk);
  return walk(root);
}

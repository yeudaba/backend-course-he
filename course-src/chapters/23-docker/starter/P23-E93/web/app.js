// P23-E93 — הדף (לא משנים): מבקש משימות מ־/api (אותו origin — בלי CORS)
const res = await fetch("/api/health");
document.querySelector("#list").textContent = res.ok ? "השרת חי" : "השרת לא עונה";

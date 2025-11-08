const { generateStores, filterAndSort, pickFields } = require("../_stores");

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=60, max-age=10");
  res.end(body);
}

module.exports = (req, res) => {
  // CORS preflight（必要なら）
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return sendJson(res, 405, { ok: false, error: "method not allowed" });
  }

  const {
    limit = "10",
    page = "1",
    q = "",
    city,
    category,
    sort = "id",
    order = "asc",
    fields, // 例: id,name,city
  } = req.query || {};

  const n = Math.max(1, Math.min(100, Number(limit) || 10));
  const p = Math.max(1, Number(page) || 1);

  const all = generateStores(150);
  const filtered = filterAndSort(all, { q, city, category, sort, order });
  const total = filtered.length;

  const start = (p - 1) * n;
  const end = start + n;
  const pageItems = filtered.slice(start, end);

  const items = pickFields(pageItems, fields);

  return sendJson(res, 200, {
    ok: true,
    page: p,
    limit: n,
    total,
    count: items.length,
    q: q || undefined,
    city: city || undefined,
    category: category || undefined,
    sort,
    order,
    items,
  });
};

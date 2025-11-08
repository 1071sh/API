const { generateStores } = require("../_stores");

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

  const { id } = req.query || {};
  const numId = Number(id);
  if (!numId || Number.isNaN(numId)) {
    return sendJson(res, 400, { ok: false, error: "invalid id" });
  }

  const stores = generateStores(150);
  const store = stores.find((s) => s.id === numId);
  if (!store) {
    return sendJson(res, 404, { ok: false, error: "store not found" });
  }

  return sendJson(res, 200, { ok: true, store });
};

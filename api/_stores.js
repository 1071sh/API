// CommonJS で書いています（VercelのServerless Functionsでそのまま動作）

const prefectures = ["東京都", "神奈川県", "大阪府", "愛知県", "北海道", "福岡県"];
const cityMap = {
  東京都: ["千代田区", "新宿区", "渋谷区", "港区"],
  神奈川県: ["横浜市", "川崎市", "藤沢市"],
  大阪府: ["大阪市", "堺市"],
  愛知県: ["名古屋市", "豊田市"],
  北海道: ["札幌市"],
  福岡県: ["福岡市", "北九州市"],
};
const baseCoords = {
  千代田区: [35.6938, 139.753],
  新宿区: [35.6938, 139.7034],
  渋谷区: [35.6595, 139.7005],
  港区: [35.6581, 139.7516],
  横浜市: [35.4437, 139.638],
  川崎市: [35.5308, 139.7036],
  藤沢市: [35.3375, 139.4876],
  大阪市: [34.6937, 135.5023],
  堺市: [34.5733, 135.4828],
  名古屋市: [35.1815, 136.9066],
  豊田市: [35.0824, 137.1563],
  札幌市: [43.0618, 141.3545],
  福岡市: [33.5902, 130.4017],
  北九州市: [33.8833, 130.8751],
};
const categories = ["cafe", "market", "bookstore", "electronics", "bakery", "fashion"];

// 簡易な擬似乱数（idとsaltに依存）: 実行ごとに同じidなら同じ結果になる程度のゆるいシード
function prng(id, salt) {
  const x = Math.sin(id * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}

function pad(num, size) {
  const s = String(num);
  return "0".repeat(Math.max(size - s.length, 0)) + s;
}

function makePhone(id) {
  // 適当な形式: 03-xxxx-xxxx ないし 06-xxxx-xxxx
  const area = id % 2 === 0 ? "03" : "06";
  const mid = pad(Math.floor(1000 + prng(id, 2) * 8999), 4);
  const last = pad(Math.floor(1000 + prng(id, 3) * 8999), 4);
  return `${area}-${mid}-${last}`;
}

function generateStores(count = 120) {
  const stores = [];
  for (let i = 1; i <= count; i++) {
    const pref = prefectures[i % prefectures.length];
    const cities = cityMap[pref];
    const city = cities[i % cities.length];
    const [lat0, lng0] = baseCoords[city];

    const category = categories[i % categories.length];
    const lat = lat0 + (prng(i, 10) - 0.5) * 0.02;
    const lng = lng0 + (prng(i, 11) - 0.5) * 0.02;

    const store = {
      id: i,
      code: `S${pad(i, 4)}`,
      name: `サンプル${category} ${pad(i, 3)}`,
      category,
      prefecture: pref,
      city,
      street: `${(i % 5) + 1}丁目 ${(i % 30) + 1}-${(i % 20) + 1}`,
      postalCode: `100-${pad((i % 9999) + 1, 4)}`,
      address: `${pref}${city} ${(i % 5) + 1}丁目 ${(i % 30) + 1}-${(i % 20) + 1}`,
      phone: makePhone(i),
      location: { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) },
      hours: {
        weekday: "10:00-20:00",
        weekend: "11:00-19:00",
        closed: i % 6 === 0 ? "水" : null,
      },
      createdAt: new Date(2023, i % 12, (i % 28) + 1).toISOString(),
      updatedAt: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
    };
    stores.push(store);
  }
  return stores;
}

function filterAndSort(stores, opts = {}) {
  const {
    q = "",
    city,
    category,
    sort = "id", // id | name | createdAt
    order = "asc", // asc | desc
  } = opts;

  let list = stores;

  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((s) => s.name.toLowerCase().includes(needle) || s.address.toLowerCase().includes(needle) || s.category.toLowerCase().includes(needle) || s.code.toLowerCase().includes(needle));
  }
  if (city) {
    list = list.filter((s) => s.city === city);
  }
  if (category) {
    list = list.filter((s) => s.category === category);
  }

  list = list.slice().sort((a, b) => {
    const dir = order === "desc" ? -1 : 1;
    if (sort === "name") return a.name.localeCompare(b.name) * dir;
    if (sort === "createdAt") return (new Date(a.createdAt) - new Date(b.createdAt)) * dir;
    return (a.id - b.id) * dir;
  });

  return list;
}

function pickFields(items, fieldsCsv) {
  if (!fieldsCsv) return items;
  const fields = String(fieldsCsv)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (fields.length === 0) return items;
  return items.map((obj) => {
    const out = {};
    for (const f of fields) if (f in obj) out[f] = obj[f];
    return out;
  });
}

module.exports = { generateStores, filterAndSort, pickFields };

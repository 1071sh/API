export default function handler(req, res) {
  const echo = req.query || {};
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    message: "Hello API",
    data: [1, 2, 3],
  });
}

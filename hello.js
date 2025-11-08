export default function handler(req, res) {
  const echo = req.query || {};
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    userId: 1,
    id: 1,
    title: "delectus aut autem",
    completed: false,
  });
}

// First search Airtable for books
// If no result, then search Google Books API

export default (req, res) => {
  res.statusCode = 200;
  res.json({ name: "John Doe" });
};

import Airtable from "airtable";

export default async (req, res) => {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    "appns6h4YWezxqUaX"
  );

  switch (req.method) {
    // Add a reference to a book
    // Providing book id, secret, and message
    case "POST": {
      const {
        secret,
        message,
        bookRecord,
        id,
        isbn,
        name,
        author,
        thumb,
      } = JSON.parse(req.body);

      const internalId =
        bookRecord ||
        (await base("Books")
          .create([{ fields: { id, isbn, name, author, thumb } }])
          .then((records) => records[0].id));

      await base("Board").create([
        { fields: { book: [internalId], message, secret } },
      ]);

      res.statusCode = 200;
      res.json({ bookRecord: internalId });
      return;
    }

    case "DELETE": {
      const { secret, bookRecord } = req.query;

      const toDelete = await base("Board")
        .select({ filterByFormula: `{secret} = "${secret}"` })
        .all()
        .then((records) =>
          records
            .filter(({ fields }) => fields.book.includes(bookRecord))
            .map(({ id, fields }) => id)
        );

      console.log(`${secret} · ${bookRecord} — Deleting`, toDelete);
      await base("Board").destroy(toDelete);
      res.statusCode = 200;
      res.end();
      return;
    }
    default:
      res.statusCode = 403;
  }
};

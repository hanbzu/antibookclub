import Head from "next/head";
import styles from "../styles/Home.module.css";
import Airtable from "airtable";
import _ from "lodash";

export default function Home({ books }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Anti book club</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <pre style={{ width: "100%" }}>{JSON.stringify(books, null, 2)}</pre>
    </div>
  );
}

export async function getStaticProps() {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    "appns6h4YWezxqUaX"
  );

  const books = await base("Books")
    .select({ filterByFormula: "{ref_count} > 1" })
    .all()
    .then((records) => records.map(({ id, fields }) => ({ id, ...fields })));

  console.log("books", books);

  const messages = await base("Board")
    .select({
      filterByFormula: `SEARCH(RECORD_ID(), "${_.uniq(
        _.flatten(books.map((d) => d.refs))
      ).join(",")}")`,
    })
    .all()
    .then((records) =>
      records.reduce(
        (acc, { id, fields }) => ({
          ...acc,
          [id]: [fields.message, fields.added],
        }),
        {}
      )
    );
  console.log("messages", messages);

  return {
    // will be passed to the page component as props
    props: {
      books: books.map(
        ({ id, name = null, author = null, refs, thumb = null }) => ({
          id,
          name,
          author,
          thumb,
          messages: refs.map((r) => messages[r]),
        })
      ),
    },
    revalidate: 10, // At most every 10 seconds
  };
}

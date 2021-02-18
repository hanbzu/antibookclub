import React from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Airtable from "airtable";
import _ from "lodash";
import { nanoid } from "nanoid";
import useLocalStorage from "../lib/useLocalStorage";
import useSearch from "../lib/useSearch";

export default function Home({ library }) {
  const [{ books, secret }, setLocal] = useLocalStorage({
    books: [],
    secret: nanoid(),
  });
  //console.log("library", library);
  //console.log("books", books, secret);
  const [search, setSearch] = React.useState("");
  const results = useSearch(search, library);
  return (
    <div className={styles.container}>
      <Head>
        <title>Anti book club</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <div>
        {results.map(
          ({ id, isbn, googleid, name, author, thumb, messages }) => (
            <div
              key={googleid || id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                height: 100,
              }}
            >
              <img src={thumb} />
              <div>
                <div>{googleid || id}</div>
                <div>{name}</div>
                {author.length > 0 && <div>author</div>}
              </div>
              <div>
                <button
                  onClick={() =>
                    setLocal((s) => ({ ...s, myBooks: [...s.myBooks, id] }))
                  }
                >
                  Add
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    "appns6h4YWezxqUaX"
  );

  const books = await base("Books")
    .select({ filterByFormula: "{ref_count} > 0" })
    .all()
    .then((records) => records.map(({ id, fields }) => ({ id, ...fields })));

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

  return {
    // will be passed to the page component as props
    props: {
      library: books.map(
        ({ id, name = "", author = "", refs, thumb = "" }) => ({
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

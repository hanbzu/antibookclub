import React from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Airtable from "airtable";
import _ from "lodash";
const { nanoid } = require("nanoid");

export default function Home({ library }) {
  const [{ books, secret }, setLocal] = useLocalStorage({
    books: [],
    secret: nanoid(),
  });
  console.log("library", library);
  console.log("books", books, secret);
  const [search, setSearch] = React.useState("");
  return (
    <div className={styles.container}>
      <Head>
        <title>Anti book club</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <div>
        {library
          .filter(
            (d) =>
              search.length > 0 &&
              (d.name.toLowerCase().includes(search.toLowerCase()) ||
                d.author.toLowerCase().includes(search.toLowerCase()))
          )
          .map(({ id, name, author, thumb, messages }) => (
            <div key={id}>
              {name}, by {author}{" "}
              <button
                onClick={() =>
                  setLocal((s) => ({ ...s, myBooks: [...s.myBooks, id] }))
                }
              >
                + Add
              </button>
            </div>
          ))}
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

function useLocalStorage(initialState) {
  const [state, setState] = React.useState(
    process.browser &&
      JSON.parse(
        localStorage.getItem("antibookclub-v1") || JSON.stringify(initialState)
      )
  );
  return [
    state,
    (f) => {
      const newState = f(state);
      setState(newState);
      localStorage.setItem("antibookclub-v1", JSON.stringify(newState));
    },
  ];
}

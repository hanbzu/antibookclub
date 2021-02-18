import React from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Airtable from "airtable";
import _ from "lodash";
import { nanoid } from "nanoid";
import useLocalStorage from "../lib/useLocalStorage";
import useSearch from "../lib/useSearch";

export default function Home({ library }) {
  const [{ books, secret, message }, setLocal] = useLocalStorage({
    books: [],
    message: "",
    secret: nanoid(),
  });
  //console.log("library", library);
  //console.log("books", books, message, secret);
  const [search, setSearch] = React.useState("");
  const results = useSearch(search, library);
  return (
    <div className={styles.container}>
      <Head>
        <title>Anti book club</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ display: "flex" }}>
        {(books || []).map(({ bookRecord, id, thumb }) => (
          <div style={{ border: "1px solid salmon" }} key={id}>
            <div>
              <img src={thumb} style={{ height: 100 }} />
            </div>
            <div>
              <button
                onClick={() => {
                  setLocal((s) => ({
                    books: s.books.filter((d) => d.id !== id),
                  }));
                  fetch(`api/${bookRecord}?secret=${secret}`, {
                    method: "DELETE",
                  });
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <input
          value={message}
          onChange={(e) => setLocal((s) => ({ message: e.target.value }))}
          placeholder="contact message"
        />
      </div>
      <div></div>
      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search"
        />
      </div>
      <div>
        {results.map(
          ({ bookRecord, id, isbn, name, author, thumb, messages }) => (
            <div
              key={id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                height: 100,
              }}
            >
              <img src={thumb} />
              <div>
                <div>{id}</div>
                <div>{name}</div>
                {author.length > 0 && <div>{author}</div>}
              </div>
              <div>
                <button
                  disabled={message.length === 0}
                  onClick={() => {
                    setSearch("");
                    fetch("api/post", {
                      method: "POST",
                      body: JSON.stringify({
                        secret,
                        message,
                        bookRecord,
                        id,
                        isbn,
                        name,
                        author,
                        thumb,
                      }),
                    })
                      .then((res) => res.json())
                      .then(({ bookRecord }) =>
                        setLocal((s) => ({
                          books: [
                            ...s.books,
                            { bookRecord, id, isbn, name, author, thumb },
                          ],
                        }))
                      );
                  }}
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
    .then((records) =>
      records.map(({ id, fields }) => ({ bookRecord: id, ...fields }))
    );

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
        ({
          bookRecord,
          id,
          isbn = "",
          name = "",
          author = "",
          refs,
          thumb = "",
        }) => ({
          bookRecord,
          id,
          isbn,
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

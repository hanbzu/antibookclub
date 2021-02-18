import React from "react";
import useDebounce from "./useDebounce";
import _ from "lodash";

// TODO: Add fuzzy search for the local part
export default function useSearch(search, localLibrary) {
  const localResults =
    search.length === 0
      ? []
      : localLibrary.filter(
          ({ name, author }) =>
            name.toLowerCase().includes(search.toLowerCase()) ||
            author.toLowerCase().includes(search.toLowerCase())
        );
  const debouncedSearch = useDebounce(search, 500);
  const [remoteResults, setRemoteResults] = React.useState([]);
  React.useEffect(() => {
    const abortController = new AbortController();

    if (debouncedSearch.length > 0) {
      fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURI(search)}`,
        { signal: abortController.signal }
      )
        .then((res) => res.json())
        .then(({ items }) => items?.map(convertData))
        .then((res) => {
          //console.log("Result for", search, res);
          setRemoteResults(res);
        });
    } else {
      if (remoteResults.length > 0) setRemoteResults([]);
    }

    return () => abortController.abort();
  }, [debouncedSearch]);

  // First we show local results
  // bacuse these already have some messages in the board
  // console.log("localResults", localResults);
  // console.log("remoteResults", remoteResults);
  return _.uniqWith(
    [...localResults, ...remoteResults],
    (a, b) => a.id === b.id
  );
}

const convertData = ({ volumeInfo, id }) => {
  const {
    title,
    imageLinks = {},
    authors = [],
    industryIdentifiers = [],
  } = volumeInfo;
  return {
    name: title,
    author: authors.join(", "),
    thumb: imageLinks.small || imageLinks.thumbnail,
    isbn: (
      industryIdentifiers.find((d) => d.type === "ISBN_13") ||
      industryIdentifiers.find((d) => d.type === "ISBN_10") ||
      {}
    ).identifier,
    id: `gid:${id}`,
  };
};

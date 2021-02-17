import React from "react";
import useDebounce from "./useDebounce";

export default function useSearch(search, localLibrary) {
  const localResults =
    search.length === 0
      ? []
      : localLibrary.filter(
          ({ name, author }) =>
            name.toLowerCase().includes(search.toLowerCase()) ||
            author.toLowerCase().includes(search.toLowerCase())
        );
  const debouncedSearch = useDebounce(search, 300);
  const [remoteResults, setRemoteResults] = React.useState([]);
  React.useEffect(() => {
    const abortController = new AbortController();

    if (debouncedSearch.length > 0 && localResults.length === 0) {
      fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURI(search)}`,
        { signal: abortController.signal }
      )
        .then((res) => res.json())
        .then(({ items }) => items?.map(convertData))
        .then((res) => {
          console.log("Result for", search, res);
          setRemoteResults(res);
        });
    }

    return () => abortController.abort();
  }, [debouncedSearch]);

  return [...localResults, ...remoteResults];
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
    googleid: id,
  };
};

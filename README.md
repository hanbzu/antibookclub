# Anti Book Club

## Context

To find people to read a book with (~ a book club).

## Forces that make demands on the form

1 “Social contact and a common schedule will make me more likely to dedicate time to this book”
2 “By exchanging ideas or trying to explain my understanding I’ll be more likely to make real use of the material in my mind”
3 “I already know people who I’d enjoy doing this with”
4 “I don’t want to commit to maintaining a list in yet another app. Ideally this is a one stop thing for me”
5 “I’d like to know when there’s quorum to start reading a book”
6 “It’s okay, I can organise the meetings by myself, but I need to know who wants to read this book”
7 “I’d like to know what this person I barely know now is wanting to read”

## Resolve related forces into diagrams

1 Add book I want to read
2 See if there's books where I can start a club
3 Contact the people to start the club on a book

## Pattern language

- One club per book.
- No more than 5 books. This is for finding people, not a place to hold a reading list.
- A shareable link will allow you to share your books with friends. This is the primary way of comming up with people for your club.
- Immediate, link-to-usage. No signing up, no setting up. You should be done in under 5 minutes.
- Ephemeral. Your ad is removed after some time. You need to actively bring it back if you want.
- Subsequent messages or notifications are NOT handled by the app. People need do this manually (email, Telegram, Twitter, whatever...).
- No suggestions. You know what books you'd like to read.

## Place the built form into context and look for misfits

## Implementation details

An Airtable automation can delete old demand periodically: https://community.airtable.com/t/how-to-mark-a-record-for-deletion-automatically-after-18-hours/33533/2 (100 runs per month in free tier).

TODO:

- See messages in the books
- Friend page (you can add any of the books your friend suggested)
- Styling and clear copy

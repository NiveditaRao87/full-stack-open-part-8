import {gql} from '@apollo/client'

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    author{
      name
      born
      id
    }
    published
    genres
    id
  }
`

export const ALL_AUTHORS = gql`
query {
  allAuthors  {
    name
    born
    bookCount
    id
  }
}
`

export const ALL_BOOKS = gql`
query {
  allBooks  {
   ...BookDetails
  }
}
${BOOK_DETAILS}
`

export const BOOKS_BY_GENRE = gql`
query booksByGenre($genre: String!) {
  allBooks(genre: $genre){
    ...BookDetails
  }
}
${BOOK_DETAILS}
`

export const ME = gql`
query {
  me {
    username
    favoriteGenre
  }
}`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const CREATE_BOOK = gql`
mutation createBook($title: String!, $published: Int!, $author: String!, $genres: [String!]!) {
  addBook(
    title: $title,
    published: $published,
    author: $author,
    genres: $genres
  ) {
    title
    published
    author {
      name
      born
      id
    }
    genres
    id
  }
}
`

export const EDIT_BIRTHYEAR = gql`
mutation editAuthor($name: String!, $born: Int!) {
  editAuthor(name: $name, setBornTo: $born) {
    name
    born
    id
  }
}
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`
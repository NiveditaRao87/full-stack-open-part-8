import React, { useEffect, useState } from 'react'
import { useQuery } from "@apollo/client"
import { ALL_BOOKS } from '../queries'

const Books = (props) => {

  const books = useQuery(ALL_BOOKS)
  const [booksToShow, setBooksToShow] = useState([])

  useEffect(() => {
    books.data && setBooksToShow(books.data.allBooks)
  },[books])

  if (!props.show) {
    return null
  }
  if (books.loading) {
    return <div>loading... </div>
  }

  const allBooks = books.data.allBooks
  const genres = (allBooks.map(book => book.genres)).reduce((a,b) => a.concat(b))
  const genreButtons = [...new Set(genres)]

  const filterByGenre = (genre) => {
    setBooksToShow(allBooks.filter(book => book.genres.includes(genre)))
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {booksToShow.map(b =>
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      {genreButtons.map(genre => <button key={genre} onClick={()=>filterByGenre(genre)}>{genre}</button>)}
      <button onClick={() => setBooksToShow(allBooks)}>all genres</button>
    </div>
  )
}

export default Books
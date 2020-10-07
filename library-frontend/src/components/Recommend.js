import React, { useEffect, useState } from 'react'
import { useLazyQuery } from "@apollo/client"
import { BOOKS_BY_GENRE } from '../queries'

const Recommend = ({show, genre}) => {

  const [getBooks, result] = useLazyQuery(BOOKS_BY_GENRE)
  const [books, setBooks] = useState(null)

  useEffect(() => {
    if(genre){
          getBooks({variables: {genre }})
      }
  }, [genre]) // eslint-disable-line
  useEffect(() => {
    if(result.data){
        setBooks(result.data.allBooks)
    }
  }, [result])
  if(!show || !genre){
    return null
  }

  return (
      <div>
          <h2>Recommendations</h2>
          <p>books in your favorite genre 
            <strong> {genre}</strong>
          </p>
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
          {books.map(b =>
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
  )
}

export default Recommend

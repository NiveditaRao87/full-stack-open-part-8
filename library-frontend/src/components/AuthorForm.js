import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import Select from 'react-select'

import { EDIT_BIRTHYEAR } from '../queries'

const AuthorForm = ({authors}) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  
  const [ changeBirthYear ] = useMutation(EDIT_BIRTHYEAR)

  const options = authors.map(author =>  {
    return { 
      value: author.name, 
      label: author.name 
    }
  })

  const submit = (event) => {
    event.preventDefault()

    changeBirthYear({ variables: { name: name.value, born } })

  }


  return (
    <>
      <h3>Set birthyear</h3>

      <form onSubmit={submit}>
        <div>
          name <Select
            value={name}
            onChange={setName}
            options={options}
            />
        </div>
        <div>
          born <input
            value={born}
            required
            type='number'
            onChange={({ target }) => setBorn(Number(target.value))}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </>
  )
}

export default AuthorForm
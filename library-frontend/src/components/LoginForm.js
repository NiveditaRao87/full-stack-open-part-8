import React, { useState, useEffect } from 'react'
import { useMutation, useLazyQuery } from '@apollo/client'
import { LOGIN, ME } from '../queries'

const LoginForm = ({ show, setError, setToken, setPage, setGenre }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [getCurrentUser,meResult] = useLazyQuery(ME)

  const [ login, result ] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message)
    }
  })

  useEffect(() => {
    if ( result.data ) {
      const token = result.data.login.value
      setToken(token)
      getCurrentUser()
      localStorage.setItem('library-user-token', token)
      setPage('authors')
    }
  }, [result.data]) // eslint-disable-line

  useEffect(() => {
    if(meResult.data){    
      //Since me returns null when not logged in
      if(meResult.data.me){
        const genre = meResult.data.me.favoriteGenre
        localStorage.setItem('library-user-genre', genre)
        setGenre(genre)
      }
    }
  },[meResult.data]) // eslint-disable-line

  const submit = async (event) => {
    event.preventDefault()

    login({ variables: { username, password } })
    setUsername('')
    setPassword('')
  }

  if(!show){
      return null
  }

  return (
    <div>
      <br/>
      <form onSubmit={submit}>
        <div>
          username <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>login</button>
      </form>
      <br/>
    </div>
  )
}

export default LoginForm
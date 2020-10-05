const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

console.log('connecting to', process.env.MONGODB_URI)

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Author {
      name: String!
      id: ID!
      born: Int
      bookCount: Int!
  }

  type Book {
      title: String!
      published: Int!
      author: Author!
      id: ID!
      genres: [String!]!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
      bookCount: Int!
      authorCount: Int!
      allBooks(author: String, genre: String): [Book!]!
      allAuthors: [Author!]!
      me: User
  }

  type Mutation {
      addBook(
        title: String!
        published: Int!
        author: String!
        genres: [String!]!
      ): Book
      editAuthor(
        name: String!
        setBornTo: Int!
      ): Author
      createUser(
        username: String!
        favoriteGenre: String!
      ): User
      login(
        username: String!
        password: String!
      ): Token
  }
`

const resolvers = {
  Query: {
      bookCount: () => Book.collection.countDocuments(),
      authorCount: () => Author.collection.countDocuments(),
      allBooks: async (root,args) => {

        if(!args.author && !args.genre){
          return await Book.find({}).populate('author')
        }
        if(!args.author){
          return await Book.find({genres: args.genre}).populate('author')
        }
        const foundAuthor = await Author.findOne({name: args.author})
        if(foundAuthor){
          if(!args.genre){
            return await Book.find({author: foundAuthor.id}).populate('author')
          }
          return await Book.find({genres: args.genre, author: foundAuthor.id}).populate('author')
        }
        return null
      },
    allAuthors: () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    addBook: async (root,args,context) => {
      if(!context.currentUser){
        throw new AuthenticationError('User must be logged in')
      }
      if(args.title.length < 2){
        throw new UserInputError('Title should have minimum 2 characters',{
          invalidArgs: args
        })
      }
      if(args.author.length < 4){
        throw new UserInputError('Author should have minimum 4 characters',{
          invalidArgs: args
        })
      }
      if(Book.findOne({title: args.title})){
        throw new UserInputError('Title should be unique',{
          invalidArgs: args
        })
      }
      let author = await Author.findOne({ name: args.author })
      if(!author){
        newAuthor = new Author({ name: args.author })
        author = await newAuthor.save()
      }
      const book = new Book ({ ...args, author })
      console.log(book)
      await book.save()
      return book
    }, 
    editAuthor: async (root,args,context) => {
      if(!context.currentUser){
        throw new AuthenticationError('User must be logged in')
      }
      const author = await Author.findOne({ name: args.name })
      if(!author){
        return null
      }
      author.born = args.setBornTo
      await author.save()
      return author
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
  
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
      },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
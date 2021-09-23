/* API запросов и мутаций */


const express = require('express'); // зависимость Express
const { ApolloServer, gql } = require('apollo-server-express'); // зависимость GraphQL

// Запускаем сервер на порте, указанном в файле .env, или на порте 4000
const port = process.env.PORT || 4000;

// заметки пока что хранятся в памяти
let notes = [
  {
    id: '1',
    content: 'Заметка 1',
    author: 'Пользователь 1'
  },
  {
    id: '2',
    content: 'Заметка 2 Заметка 2',
    author: 'Пользователь 2'
  },
  {
    id: '3',
    content: 'Заметка 3 Заметка 3 Заметка 3',
    author: 'Пользователь 3'
  }
];

// Построение схемы с использованием языка схем GraphQL
// notes: [Note] возвращает массив
// note(id: ID): Note запрос с указанием конкретного id заметки
// Mutation newNote создание новой заметки
const typeDefs = gql`
  type Note {
    id: ID
    content: String
    author: String
  }

  type Query {
    hello: String
    notes: [Note]
    note(id: ID): Note
  }

  type Mutation {
    newNote(content: String!): Note
  }
`;

// Предоставляем функции распознавания для полей схемы
// запросы идут к typeDefs => type Query
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    notes: () => notes,
    note: (parent, args) => {
      return notes.find(note => note.id === args.id); // запрос-поиск по id
    }
  },
  Mutation: { // распознаватель мутации
    newNote: (parent, args) => { // typeDefs => type Mutation
      let noteValue = {
        id: String(notes.length + 1), // считаем кол-во записей в БД и добавляем единицу
        content: args.content, // берём текст записи из аругментов
        author: 'Пользователь' // жестко записываем имя автора
      };
      notes.push(noteValue); // записываем новую заметку в БД
      return noteValue; // выводит ответ с новыми content, ID и author
    }
  }
};

const app = express(); // приложеие работает на express.js

// Настройка Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Применяем промежуточное ПО Apollo GraphQL и указываем путь к /api
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () =>
  console.log(
    `GraphQL Server запущен http://localhost:${port}${server.graphqlPath}`
  )
);

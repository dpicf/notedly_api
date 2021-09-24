const express = require('express'); // зависимость Express
const { ApolloServer, gql } = require('apollo-server-express'); // зависимость GraphQL
require('dotenv').config(); // импорт конфигурации .env

const db = require('./db'); // импорт файла БД
const models = require('./models'); // добавление моделей из каталога models

// Запускаем сервер на порте, указанном в файле .env, или на порте 4000
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST; // подключение к mongoDB из .env

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
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    notes: async () => {
      return await models.Note.find(); // вывести все записи из БД
    },
    note: async (parent, args) => {
      return await models.Note.findById(args.id); // поиск заметки по id
    }
  },
  Mutation: {
    newNote: async (parent, args) => {
      return await models.Note.create({ // создание новой заметки
        content: args.content,
        author: 'Пользователь'
      });
    }
  }
};

const app = express();

db.connect(DB_HOST);

// Настройка Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Применяем промежуточное ПО Apollo GraphQL и указываем путь к /api
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () =>
  console.log(
    `GraphQL Server запущен http://localhost:${port}${server.graphqlPath}`
  )
);

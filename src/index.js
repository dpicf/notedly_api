const express = require('express');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config(); // импорт конфигурации .env

const db = require('./db'); // импорт файла БД
const models = require('./models'); // добавление моделей из каталога models
const typeDefs = require('./schema'); // схема БД
const resolvers = require('./resolvers'); // код распознователей

// Запускаем сервер на порте, указанном в файле .env, или на порте 4000
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST; // подключение к mongoDB из .env

const app = express();

db.connect(DB_HOST);

// Настройка Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    return { models }; // Добавление моделей БД в context
  }
});

// Применяем промежуточное ПО Apollo GraphQL и указываем путь к /api
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () =>
  console.log(
    `GraphQL Server запущен http://localhost:${port}${server.graphqlPath}`
  )
);

/* основной файл приложения */

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
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

// Получаем информацию пользователя из JWT
const getUser = token => {
  if (token) {
    try {
      // Возвращаем информацию пользователя из токена
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Если с токеном возникла проблема, выбрасываем ошибку
      throw new Error('Session invalid');
    }
  }
};

// Настраиваем Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Получаем токен пользователя из заголовков
    const token = req.headers.authorization;
    // Пытаемся извлечь пользователя с помощью токена
    const user = getUser(token);
    // Пока что будем выводить информацию о пользователе в консоль:
    console.log(user);
    // Добавляем модели БД и пользователя в контекст
    return { models, user };
  }
});

// Применяем промежуточное ПО Apollo GraphQL и указываем путь к /api
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () =>
  console.log(
    `GraphQL Server запущен http://localhost:${port}${server.graphqlPath}`
  )
);

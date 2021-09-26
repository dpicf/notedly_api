/* файл мутаций */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
require('dotenv').config();

const gravatar = require('../util/gravatar');

module.exports = {
  newNote: async (parent, args, { models }) => {
    return await models.Note.create({
      content: args.content,
      author: 'Пользователь'
    });
  },
  deleteNote: async (parent, { id }, { models }) => {
    try {
      await models.Note.findOneAndRemove({ _id: id });
      return true;
    } catch (err) {
      return false;
    }
  },
  updateNote: async (parent, { content, id }, { models }) => {
    try {
      return await models.Note.findOneAndUpdate(
        { // поиск по id
          _id: id
        },
        {
          $set: { // новое содержимое заметки
            content
          }
        },
        { // возврат обновлённой заметки
          new: true
        }
      );
    } catch (err) {
      throw new Error('Ошибка обновления записи');
    }
  },
  signUp: async (parent, { username, email, password }, { models }) => {
    email = email.trim().toLowerCase(); // к нижнему регистру, удаляем проблемы
    const hashed = await bcrypt.hash(password, 10); // хэшируем пароль
    const avatar = gravatar(email); // Создаем url gravatar-изображения
    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed
      });

      // Создаем и возвращаем json web token
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (err) {
      // Если при регистрации возникла проблема, выбрасываем ошибку
      throw new Error('Ошибка создания аккаунта');
    }
  },
  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      email = email.trim().toLowerCase(); // к нижнему регистру, удаляем проблемы
    }

    const user = await models.User.findOne({
      $or: [{ email }, { username }]
    });

    // Если пользователь не найден, выбрасываем ошибку аутентификации
    if (!user) {
      throw new AuthenticationError('Ошибка авторизации');
    }

    // сравниваем пароли
    const valid = await bcrypt.compare(password, user.password);
    // Если пароли не совпадают, выбрасываем ошибку аутентификации
    if (!valid) {
      throw new AuthenticationError('Ошибка авторизации');
    }

    // Создаем и возвращаем json web token
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  }
};

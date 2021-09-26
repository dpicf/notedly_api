/* файл мутаций */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();

const gravatar = require('../util/gravatar');

module.exports = {
  newNote: async (parent, args, { models, user }) => {
    // Если в контексте нет пользователя, выбрасываем AuthenticationError
    if (!user) {
      throw new AuthenticationError('Вы должны быть авторизованы для создания заметки');
    }

    return await models.Note.create({
      content: args.content,
      author: mongoose.Types.ObjectId(user.id), // Ссылаемся на mongo id автора
      favoriteCount: 0
    });
  },
  deleteNote: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('Вы должны быть авторизованы, чтобы удалить заметку');
    }

    // находим заметку
    const note = await models.Note.findById(id);
    // Если владелец заметки и текущий пользователь не совпадают, выбрасываем forbidden error
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("У вас нет прав на удаление этой заметки");
    }

    try {
      await note.remove(); // Если все проверки проходят, удаляем заметку
      return true;
    } catch (err) {
      return false; // Если в процессе возникает ошибка, возвращаем false
    }
  },
  updateNote: async (parent, { content, id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('Вы должны быть авторизованы, чтобы обновить заметку');
    }

    // находим заметку
    const note = await models.Note.findById(id);
    // Если владелец заметки и текущий пользователь не совпадают, выбрасываем forbidden error
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("У вас нет прав на обновление этой заметки");
    }

    // Обновляем заметку в БД и возвращаем ее в обновленном виде
    return await models.Note.findOneAndUpdate(
      {
        _id: id
      },
      {
        $set: {
          content
        }
      },
      {
        new: true
      }
    );
  },
  toggleFavorite: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError();
    }

    // Проверяем, отмечал ли пользователь заметку как избранную
    let noteCheck = await models.Note.findById(id);
    const hasUser = noteCheck.favoritedBy.indexOf(user.id);

    // Если пользователь есть в списке, удаляем его оттуда и уменьшаем значение favoriteCount на 1
    if (hasUser >= 0) {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: -1
          }
        },
        {
          // Устанавливаем new как true, чтобы вернуть обновленный документ
          new: true
        }
      );
    } else {
      // Если пользователя в списке нет, добавляем его туда и увеличиваем значение favoriteCount на 1
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: 1
          }
        },
        {
          new: true
        }
      );
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

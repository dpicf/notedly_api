/* модель БД заметки */

// Запросим библиотеку mongoose
const mongoose = require('mongoose');

// Определяем схему БД заметки
const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId, // ссылка на object ID автора
      ref: 'User',
      required: true
    },
    favoriteCount: {
      type: Number,
      default: 0
    },
    favoritedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    // Присваиваем поля createdAt и updatedAt с типом Date
    timestamps: true
  }
);

// Определяем модель 'Note' со схемой
const Note = mongoose.model('Note', noteSchema);

// Экспортируем модуль
module.exports = Note;

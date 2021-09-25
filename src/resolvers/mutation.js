/* файл мутаций */

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
  }
};

module.exports = {
  // При запросе передаётся информация об авторе заметки
  author: async (note, args, { models }) => {
    return await models.User.findById(note.author);
  },
  // При запросе передаётся информация favoritedBy для заметки
  favoritedBy: async (note, args, { models }) => {
    return await models.User.find({ _id: { $in: note.favoritedBy } });
  }
};

// данное приложение выводит страницу в браузере и сообщение в консоли
// запуск при помощи npm run dev

const express = require('express'); // устанавливаем зависимость в константу

const app = express(); // создаём объект app
const port = process.env.PORT || 4000; // установить порт 4000

app.get('/', (req, res) => res.send('Hello World')); // при обращении к корневому каталогу выводить Hello World!!!

app.listen(port, () =>
  console.log(`Сервер запущен http://localhost:${port}`) // выводить в консоль сообщение при помощи callback-функции
);

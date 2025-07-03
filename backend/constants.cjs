// CommonJS version of quiz questions for backend

exports.QUIZ_QUESTIONS = [
  {
    id: 'q-initial-1',
    questionText: "Что такое VSL (Video Sales Letter)?",
    options: [
      "Видео-презентация продукта с целью продажи",
      "Система видеонаблюдения",
      "Формат видеофайла",
      "Язык программирования для создания видео"
    ],
    correctAnswer: 0,
    explanation: "VSL (Video Sales Letter) - это видео-презентация продукта или услуги, созданная с целью продажи. Это эффективный маркетинговый инструмент, сочетающий визуальный и аудио контент для убеждения зрителя совершить покупку."
  },
  {
    id: 'q-initial-2',
    questionText: "Какой основной элемент должен присутствовать в эффективном VSL?",
    options: [
      "Яркие спецэффекты",
      "Четкий призыв к действию (CTA)",
      "Знаменитости в кадре",
      "Музыкальное сопровождение"
    ],
    correctAnswer: 1,
    explanation: "Четкий призыв к действию (Call-to-Action) является критически важным элементом любого эффективного VSL. Он направляет зрителя к следующему шагу, будь то покупка, подписка или другое целевое действие."
  },
  // The rest of the questions are omitted for brevity
  // In a real implementation, all questions would be included
];

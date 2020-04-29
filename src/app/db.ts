export const data = {
  categories: [
    {
      id: 1,
      name: 'ארוחות בוקר',
      color: '#A5EABF'
    },
    {
      id: 2,
      name: 'ארוחות צהריים',
      color: '#8DD7D9'
    },
    {
      id: 3,
      name: 'ארוחות ערב',
      color: '#F6E193'
    },
    {
      id: 4,
      name: 'קינוחים',
      color: '#F6B8A2'
    },
    {
      id: 5,
      name: 'דגים',
      color: '#D4DFE9'
    },
    {
      id: 6,
      name: 'מרקים',
      color: '#E2BADE'
    },
    {
      id: 7,
      name: 'איטלקי',
      color: '#EDBCBA'
    },
    {
      id: 8,
      name: 'צמחוני',
      color: '#BEC6A4'
    }
  ],
  recipes: [
    {
      id: 1,
      title: 'קציצות דגים',
      isFavourite: false,
      categories: [2, 5],
      ingredients: [],
      prep: []
    },
    {
      id: 2,
      title: 'דניס בחמאת לימון',
      isFavourite: false,
      categories: [2, 5],
      ingredients: ['2 פילה דניס', '60 גרם חמאה', 'גרידה מלימון אחד', 'כוס יין לבן', '1/4 כוס יין לבן', '3 שיני שום'],
      prep: [
        'ממיסים את החמאה במחבת ומוסיפים את גרידת הלימון.',
        'מטגנים את הדניס, כמה דקות מכל צד (מתחילים בצד ללא העור).',
        'מוציאים את הפילה ומוסיפים למחבת את השום, היין הלבן, מיץ הלימון, מלח ופלפל.',
        'מאדים את היין כמה דקות ויוצקים על הדגים.',
        'אפשר להגיש עם טימין.'
      ]
    },
    {
      id: 3,
      title: 'לזניית בטטה',
      isFavourite: false,
      categories: [3, 7, 8],
      ingredients: [],
      prep: []
    },
    {
      id: 4,
      title: 'סלט אורז קר ובטטות צלויות',
      isFavourite: false,
      categories: [3, 8],
      ingredients: [],
      prep: []
    },
    {
      id: 5,
      title: 'חומיות',
      isFavourite: true,
      categories: [4, 8],
      ingredients: [],
      prep: []
    },
    {
      id: 6,
      title: 'עוגת ביסקוויטים',
      isFavourite: true,
      categories: [4, 8],
      ingredients: [],
      prep: []
    },
    {
      id: 7,
      title: 'עוגת לוטוס',
      isFavourite: false,
      categories: [4, 8],
      ingredients: [],
      prep: []
    },
    {
      id: 8,
      title: 'פיצה עם סלאמי',
      isFavourite: false,
      categories: [3, 7],
      ingredients: [],
      prep: []
    },
    {
      id: 9,
      title: 'פסטה ארביאטה',
      isFavourite: false,
      categories: [2, 3, 7, 8],
      ingredients: [],
      prep: []
    },
    {
      id: 10,
      title: 'פסטה ראגו',
      isFavourite: true,
      categories: [2, 3, 7],
      ingredients: [],
      prep: []
    },
    {
      id: 11,
      title: 'פילה סלמון',
      isFavourite: false,
      categories: [2, 5],
      ingredients: [],
      prep: []
    },
    {
      id: 12,
      title: 'רצועות חזה עוף בלימון ודבש',
      isFavourite: false,
      categories: [],
      ingredients: [],
      prep: []
    },
    {
      id: 13,
      title: 'מרק עדשים',
      isFavourite: false,
      categories: [3, 6, 8],
      ingredients: [],
      prep: []
    },
    {
      id: 14,
      title: 'מרק פטריות',
      isFavourite: false,
      categories: [3, 6, 8],
      ingredients: [],
      prep: []
    },
    {
      id: 15,
      title: 'שקשוקה מקסיקנית',
      isFavourite: false,
      categories: [],
      ingredients: [],
      prep: []
    },
    {
      id: 16,
      title: 'בנדיקט',
      isFavourite: false,
      categories: [3, 8],
      ingredients: [],
      prep: []
    },
    {
      id: 17,
      title: 'אפוגטו',
      isFavourite: false,
      categories: [4, 7, 8],
      ingredients: [],
      prep: []
    },
    {
      id: 18,
      title: "סביצ'ה",
      isFavourite: false,
      categories: [2, 3, 5],
      ingredients: [],
      prep: []
    },
    {
      id: 19,
      title: 'בורקס',
      isFavourite: false,
      categories: [3, 8],
      ingredients: [],
      prep: []
    },
    {
      id: 20,
      title: 'ראמן',
      isFavourite: false,
      categories: [2, 3, 6],
      ingredients: [],
      prep: []
    },
    {
      id: 21,
      title: 'ריזוטו',
      isFavourite: false,
      categories: [3, 7, 8],
      ingredients: [],
      prep: []
    }
  ]
};

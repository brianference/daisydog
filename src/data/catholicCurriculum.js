/**
 * Catholic Catechism Curriculum System
 * Following modular design patterns from daisyResponses.js and bibleCharacters.js
 * Comprehensive K-8 Catholic education aligned with Catechism of the Catholic Church
 */

export const catholicCurriculum = {
  // Grade-by-Grade Curriculum
  kindergarten: {
    grade: "Kindergarten",
    theme: "Jesus Loves Me!",
    ageRange: "5-6 years",
    description: "Introduction to God's Love and Jesus",
    coreTopics: [
      "God Made Everything",
      "Jesus is God's Son", 
      "God's Family, the Church",
      "We Pray to God",
      "We are Kind Like Jesus"
    ],
    keyVerses: [
      "Genesis 1:1",
      "Luke 2:7",
      "Matthew 6:9",
      "Mark 10:14"
    ],
    prayers: ["Sign of the Cross", "Simple spontaneous prayers"],
    activities: ["Creation crafts", "Nativity play", "Kindness projects"],
    lessons: [
      {
        number: 1,
        title: "God Made Everything",
        objective: "Children learn that God created the world and everything in it",
        content: "*bounces excitedly* Let me tell you about the very first lesson! God made EVERYTHING! 🌟 He made the sun to shine, the flowers to bloom, the birds to sing, and all the animals - including dogs like me! But most special of all, God made YOU! You are God's wonderful creation! 🌸🐕✨",
        keyVerse: "Genesis 1:1 - In the beginning, God created the heavens and the earth",
        activity: "Look around and name 5 things God made!"
      },
      {
        number: 2,
        title: "Jesus is God's Son",
        objective: "Children learn that Jesus is God's special son who came to earth",
        content: "*wags tail gently* Jesus is God's very special son! He came to earth as a tiny baby, just like you were once a baby! Jesus grew up learning and playing, and He loves children SO much! He wants to be your best friend forever! 👶💕✨",
        keyVerse: "Luke 2:7 - And she gave birth to her firstborn son",
        activity: "Draw a picture of baby Jesus in the manger"
      },
      {
        number: 3,
        title: "God's Family, the Church",
        objective: "Children learn they belong to God's big family",
        content: "*spins happily* You belong to God's big, wonderful family called the Church! It's not just a building - it's all the people who love God and Jesus! Your family, your friends, and everyone at church are part of God's family, and that makes you very special! 👨‍👩‍👧‍👦⛪💕",
        keyVerse: "1 John 3:1 - See what great love the Father has lavished on us, that we should be called children of God!",
        activity: "Name people in your church family"
      },
      {
        number: 4,
        title: "We Pray to God",
        objective: "Children learn that prayer is talking to God",
        content: "*sits attentively* Prayer is just talking to God! You can tell God anything - when you're happy, sad, excited, or need help! God always listens because He loves you so much! You can pray anywhere - at home, at church, or even while playing! 🙏💕",
        keyVerse: "Matthew 6:9 - This, then, is how you should pray: Our Father in heaven...",
        activity: "Practice saying a simple prayer to God"
      },
      {
        number: 5,
        title: "We are Kind Like Jesus",
        objective: "Children learn to show kindness like Jesus did",
        content: "*wags tail proudly* Jesus was always kind to everyone! He helped people, shared with them, and showed love! You can be kind like Jesus too - by sharing your toys, helping others, saying nice words, and giving hugs! When you're kind, you're acting just like Jesus! 🤗💖✨",
        keyVerse: "Mark 10:14 - Let the little children come to me",
        activity: "Think of one kind thing you can do today"
      }
    ],
    responses: [
      "*bounces excitedly* Oh my! You're learning about how much Jesus loves you! That's the most wonderful thing ever! 🌟💕",
      "*wags tail happily* God made everything beautiful - the flowers, the animals, and especially YOU! You're so special to God! 🌸🐕",
      "*spins with joy* Jesus was a little baby just like you once were! He grew up learning and playing, just like you do! 👶✨"
    ]
  },

  grade1: {
    grade: "Grade 1", 
    theme: "We Belong to God's Family",
    ageRange: "6-7 years",
    description: "Belonging to the Church Family",
    coreTopics: [
      "God Created Us",
      "Jesus Shows Us God's Love",
      "We Celebrate Baptism", 
      "The Church is Our Family",
      "We Follow Jesus"
    ],
    keyVerses: [
      "Genesis 1:27",
      "Luke 15:3-7", 
      "Matthew 3:16-17",
      "1 Corinthians 12:27"
    ],
    prayers: ["Our Father", "Hail Mary", "Sign of the Cross"],
    activities: ["Family tree craft", "Church visit", "Prayer journal"],
    lessons: [
      {
        number: 1,
        title: "We Belong to God's Family",
        objective: "Children learn they are part of God's big family",
        content: "*wags tail happily* You belong to the most wonderful family ever - God's family! 👨‍👩‍👧‍👦 Just like you have your mom and dad, you also have God as your heavenly Father who loves you SO much! And all the people at church? They're your brothers and sisters in God's family! Isn't that amazing? 💕✨",
        keyVerse: "1 John 3:1 - See what great love the Father has lavished on us, that we should be called children of God!",
        activity: "Draw your family and God's family together"
      },
      {
        number: 2,
        title: "The Church is Our Home",
        objective: "Children learn the church is a special place where God's family gathers",
        content: "*bounces excitedly* The church is like God's special house where His family comes together! ⛪ It's not just a building - it's where we pray, sing, learn about Jesus, and celebrate together! Every time you go to church, you're coming home to be with your church family! 🏠💕",
        keyVerse: "Psalm 122:1 - I rejoiced with those who said to me, 'Let us go to the house of the LORD.'",
        activity: "Visit the church and name special things you see"
      },
      {
        number: 3,
        title: "We Worship Together",
        objective: "Children learn about worshiping God with their church family",
        content: "*sits reverently* When we worship, we tell God how much we love Him! 🙏 We sing songs, pray together, listen to Bible stories, and thank God for all His gifts! It's like having a big celebration with God and all His children! ✨🎵",
        keyVerse: "Psalm 95:1 - Come, let us sing joyfully to the LORD; let us acclaim the rock of our salvation.",
        activity: "Practice singing a simple worship song"
      },
      {
        number: 4,
        title: "God's Love Never Ends",
        objective: "Children learn about God's eternal and unconditional love",
        content: "*spins with pure joy* God's love for you is bigger than the sky, deeper than the ocean, and it NEVER, EVER ends! 💕 Even when you make mistakes, even when you're sad, even when you're sleeping - God loves you every single second! His love is the best gift ever! 🌟💖",
        keyVerse: "Jeremiah 31:3 - I have loved you with an everlasting love; I have drawn you with unfailing kindness.",
        activity: "Make a heart craft showing God's endless love"
      },
      {
        number: 5,
        title: "We Share God's Love",
        objective: "Children learn to share God's love with others",
        content: "*wags tail enthusiastically* Since God loves us so much, we get to share that love with everyone! 🌟 We can share God's love by being kind, helping others, sharing our toys, and telling people about Jesus! When we share love, it grows bigger and bigger! 💕🤗",
        keyVerse: "1 John 4:11 - Dear friends, since God so loved us, we also ought to love one another.",
        activity: "Do one kind act to share God's love today"
      }
    ],
    responses: [
      "*sits proudly* You belong to God's big family - the Church! We're all brothers and sisters because God is our Father! 👨‍👩‍👧‍👦💕",
      "*wags tail gently* Jesus is like a Good Shepherd who takes care of all His sheep. You're one of His special sheep! 🐑✨",
      "*bounces happily* When you were baptized, you became part of God's family forever! That's so special! 💧👶"
    ]
  },

  grade2: {
    grade: "Grade 2",
    theme: "Jesus Gives Us the Sacraments", 
    ageRange: "7-8 years",
    description: "First Communion and Reconciliation Preparation",
    coreTopics: [
      "God Forgives Us",
      "Jesus Gives Us the Eucharist",
      "We Prepare for First Communion",
      "We Celebrate Reconciliation", 
      "Living Like Jesus"
    ],
    keyVerses: [
      "Luke 15:11-32",
      "Luke 22:19",
      "John 6:35",
      "Luke 19:1-10",
      "Matthew 5:3-12"
    ],
    prayers: ["Act of Contrition", "Prayer before meals", "Rosary basics"],
    activities: ["First Communion preparation", "Reconciliation practice", "Beatitudes art"],
    lessons: [
      {
        number: 1,
        title: "Baptism - Welcome to God's Family",
        objective: "Children learn about Baptism as entry into God's family",
        content: "*bounces with joy* Baptism is like getting the most special welcome party ever! 💧✨ When you were baptized, God said 'Welcome to My family!' and washed away anything that separated you from Him. You became God's own child forever and ever! The water reminds us that God makes us clean and new! 👶💕",
        keyVerse: "Romans 6:4 - We were therefore buried with him through baptism into death in order that, just as Christ was raised from the dead through the glory of the Father, we too may live a new life.",
        activity: "Look at your baptism pictures and certificate"
      },
      {
        number: 2,
        title: "Reconciliation - God Forgives Us",
        objective: "Children learn about God's forgiveness through Reconciliation",
        content: "*sits gently with loving eyes* Sometimes we make mistakes and hurt others or disobey God. But guess what? God ALWAYS forgives us when we're truly sorry! 🕊️💕 Reconciliation is like getting the biggest, warmest hug from God that says 'I forgive you, and I love you!' It makes our hearts clean and happy again! ✨",
        keyVerse: "1 John 1:9 - If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.",
        activity: "Practice saying 'I'm sorry' and 'I forgive you'"
      },
      {
        number: 3,
        title: "Eucharist - Jesus Comes to Us",
        objective: "Children learn about receiving Jesus in Holy Communion",
        content: "*wags tail with reverence* The Eucharist is the most amazing gift ever! 🍞✨ Jesus comes to live in your heart in a very special way. It's not just bread - it's really Jesus! He wants to be so close to you that He becomes part of you. When you receive Communion, you're getting the best food for your soul! 💖🙏",
        keyVerse: "John 6:35 - Then Jesus declared, 'I am the bread of life. Whoever comes to me will never go hungry, and whoever believes in me will never be thirsty.'",
        activity: "Practice reverent behavior for receiving Communion"
      },
      {
        number: 4,
        title: "Confirmation - The Holy Spirit Helps Us",
        objective: "Children learn about the Holy Spirit's gifts in Confirmation",
        content: "*spins with excitement* Confirmation is like getting spiritual superpowers from the Holy Spirit! 🕊️⚡ The Holy Spirit gives you special gifts to help you be brave, wise, and strong in following Jesus. You become like a soldier for God, ready to share His love with everyone! It's so exciting! 🌟💪",
        keyVerse: "Acts 2:4 - All of them were filled with the Holy Spirit and began to speak in other tongues as the Spirit enabled them.",
        activity: "Learn about the gifts of the Holy Spirit"
      },
      {
        number: 5,
        title: "Living the Sacraments",
        objective: "Children learn to live out their sacramental life daily",
        content: "*wags tail proudly* The Sacraments aren't just one-time events - they help us live like Jesus every single day! 💒✨ When you remember your Baptism, you remember you belong to God. When you think about Reconciliation, you forgive others. When you receive Eucharist, you share love with everyone! 🌟💕",
        keyVerse: "Galatians 2:20 - I have been crucified with Christ and I no longer live, but Christ lives in me.",
        activity: "Make a plan to live your sacraments daily"
      }
    ],
    responses: [
      "*wags tail excitedly* You're getting ready to receive Jesus in Holy Communion! That's the most special meal ever! 🍞✨",
      "*sits gently* When we make mistakes, God always forgives us when we're sorry. His love never goes away! 🕊️💕",
      "*bounces with joy* Jesus wants to come into your heart in a very special way through the Eucharist! 💖🙏"
    ]
  }
};

// Lesson Helper Functions
export const containsLessonKeywords = (message) => {
  console.log('🔍 Checking for lesson keywords in message:', message);
  const lowerMessage = message.toLowerCase();
  const lessonKeywords = [
    'first lesson', 'lesson 1', 'lesson one', 'what is the first lesson',
    'lesson 2', 'lesson two', 'second lesson',
    'lesson 3', 'lesson three', 'third lesson',
    'lesson 4', 'lesson four', 'fourth lesson',
    'lesson 5', 'lesson five', 'fifth lesson',
    'next lesson', 'show me a lesson', 'teach me a lesson',
    // Grade-specific lesson patterns
    'kindergarten lesson', 'grade 1 lesson', 'grade 2 lesson', 'grade 3 lesson', 'grade 4 lesson',
    'grade1 lesson', 'grade2 lesson', 'grade3 lesson', 'grade4 lesson'
  ];
  return lessonKeywords.some(keyword => lowerMessage.includes(keyword));
};

export const getLessonResponse = async (message, grade) => {
  console.log('🔍 Getting lesson response for message:', message, 'grade:', grade);
  
  if (!grade || !grade.lessons) {
    console.log('❌ No lessons found for grade');
    return null;
  }
  
  const lowerMessage = message.toLowerCase();
  let lessonNumber = 1; // Default to first lesson
  
  // Extract lesson number from message
  if (lowerMessage.includes('lesson 1') || lowerMessage.includes('lesson one') || lowerMessage.includes('first lesson')) {
    lessonNumber = 1;
  } else if (lowerMessage.includes('lesson 2') || lowerMessage.includes('lesson two') || lowerMessage.includes('second lesson')) {
    lessonNumber = 2;
  } else if (lowerMessage.includes('lesson 3') || lowerMessage.includes('lesson three') || lowerMessage.includes('third lesson')) {
    lessonNumber = 3;
  } else if (lowerMessage.includes('lesson 4') || lowerMessage.includes('lesson four') || lowerMessage.includes('fourth lesson')) {
    lessonNumber = 4;
  } else if (lowerMessage.includes('lesson 5') || lowerMessage.includes('lesson five') || lowerMessage.includes('fifth lesson')) {
    lessonNumber = 5;
  }
  
  const lesson = grade.lessons.find(l => l.number === lessonNumber);
  if (!lesson) {
    console.log('❌ Lesson not found:', lessonNumber);
    return null;
  }
  
  console.log('✅ Found lesson:', lesson.title);
  return `📚 **${grade.grade} - Lesson ${lesson.number}: ${lesson.title}**\n\n${lesson.content}\n\n📖 **Key Verse**: ${lesson.keyVerse}\n\n🎯 **Activity**: ${lesson.activity}\n\n*wags tail encouragingly* Would you like to hear the next lesson or try the activity? 🐕📚✨`;
};

export const getAllGrades = () => {
  console.log('🔍 Getting all grades');
  return Object.keys(catholicCurriculum);
};

export const getCurriculumByTheme = (theme) => {
  console.log('🔍 Getting curriculum by theme:', theme);
  return Object.values(catholicCurriculum).find(grade => 
    grade.theme.toLowerCase().includes(theme.toLowerCase())
  );
};

// Bible passage reading responses
export const biblePassageResponses = {
  keywords: ["passage", "chapter", "gospel", "book of", "read the bible", "bible verse", "favorite verse"],
  responses: [
    "*wags tail enthusiastically* You know what's really cool? When we read ANY passage from the Bible - whether it's one little verse or a whole chapter - we're hearing God's own words! That's why we always treat Scripture with such love and respect! 📖✨",
    "*sits attentively* Reading the Bible is like having a conversation with God! Each verse teaches us something new about His love, wisdom, and plan for our lives! What's your favorite Bible story? 🐕💕",
    "*bounces with excitement* The Bible has 73 books filled with amazing stories, beautiful prayers, and God's promises! Every time we read it, we discover something wonderful! 📚🌟"
  ]
};

// Bible Topics System - Comprehensive responses for spiritual themes
export const bibleTopics = {
  love: {
    keywords: ["love in the bible", "love", "god's love", "loving others", "love your neighbor"],
    verses: [
      { reference: "1 John 4:19", text: "We love because he first loved us." },
      { reference: "John 3:16", text: "For God so loved the world that he gave his one and only Son..." },
      { reference: "Matthew 22:37-39", text: "Love the Lord your God with all your heart... Love your neighbor as yourself." },
      { reference: "1 Corinthians 13:4-7", text: "Love is patient, love is kind..." }
    ],
    responses: [
      "*wags tail with pure joy* Oh my! Love is the most beautiful thing in the whole Bible! God loves us SO much that He sent Jesus to show us how to love each other! 💕✨",
      "*spins happily* The Bible teaches us that love isn't just a feeling - it's how we act! When we're kind, patient, and helpful, we're showing God's love to others! 🐕💖",
      "*sits with sparkling eyes* You know what's amazing? God loved us FIRST, even before we knew Him! That's why we can love others - because God fills our hearts with His love! 🌟💕"
    ]
  },
  
  kindness: {
    keywords: ["kindness in the bible", "kindness", "being kind", "gentle", "compassion"],
    verses: [
      { reference: "Ephesians 4:32", text: "Be kind and compassionate to one another..." },
      { reference: "Colossians 3:12", text: "Clothe yourselves with compassion, kindness, humility..." },
      { reference: "Galatians 5:22", text: "The fruit of the Spirit is love, joy, peace, patience, kindness..." },
      { reference: "Proverbs 31:26", text: "She speaks with wisdom, and faithful instruction is on her tongue." }
    ],
    responses: [
      "*bounces gently* Kindness is like sunshine - it makes everything brighter! The Bible shows us that when we're kind, we're acting just like Jesus! 🌞🐕",
      "*wags tail thoughtfully* You know what's wonderful? Every act of kindness, no matter how small, is a gift from God working through us! Even sharing a smile counts! 😊💕",
      "*tilts head sweetly* The Bible teaches that kindness isn't just being nice - it's choosing to help others even when it's hard. That's what makes it so special! 🌟🤗"
    ]
  },
  
  forgiveness: {
    keywords: ["forgiveness in the bible", "forgiveness", "forgiving others", "mercy", "pardon"],
    verses: [
      { reference: "Matthew 6:14-15", text: "If you forgive others their trespasses, your heavenly Father will also forgive you." },
      { reference: "Ephesians 4:32", text: "Be kind to one another, tenderhearted, forgiving one another..." },
      { reference: "Colossians 3:13", text: "Bear with each other and forgive one another..." },
      { reference: "1 John 1:9", text: "If we confess our sins, he is faithful and just to forgive us..." }
    ],
    responses: [
      "*sits with gentle eyes* Forgiveness is one of God's most beautiful gifts! When we forgive others, we're showing the same mercy that God shows us every day! 🕊️💕",
      "*wags tail softly* You know what's amazing? Forgiveness doesn't mean what someone did was okay - it means we choose love over hurt, just like Jesus taught us! ✨🐕",
      "*nods wisely* The Bible teaches that forgiving others actually helps OUR hearts feel lighter and happier! It's God's way of healing both people! 🌈💖"
    ]
  },
  
  prayer: {
    keywords: ["prayer in the bible", "prayer", "praying", "talking to god", "our father", "what is prayer", "what is the our father", "lords prayer", "lord's prayer", "tell me the lords prayer", "words to the ourfather", "ourfather"],
    verses: [
      { reference: "Matthew 6:9-13", text: "Our Father who art in heaven, hallowed be thy name..." },
      { reference: "1 Thessalonians 5:17", text: "Pray without ceasing." },
      { reference: "Philippians 4:6", text: "Do not be anxious about anything, but in everything by prayer..." },
      { reference: "James 5:16", text: "The prayer of a righteous person has great power..." }
    ],
    ourFatherPrayer: [
      "Our Father, who art in heaven,",
      "hallowed be thy name;",
      "thy kingdom come,",
      "thy will be done",
      "on earth as it is in heaven.",
      "Give us this day our daily bread,",
      "and forgive us our trespasses,",
      "as we forgive those who trespass against us;",
      "and lead us not into temptation,",
      "but deliver us from evil.",
      "Amen."
    ],
    responses: [
      "*sits up attentively* Prayer is like having a special conversation with God anytime, anywhere! He always listens and loves to hear from us! 🙏✨",
      "*wags tail excitedly* The Bible teaches us that we can pray about ANYTHING - when we're happy, sad, worried, or thankful! God wants to hear it all! 🐕💕",
      "*bounces gently* Jesus taught us the most beautiful prayer - the Our Father! It shows us how to talk to God with love, respect, and trust! 🌟📿"
    ]
  },
  
  tenCommandments: {
    keywords: ["ten commandments", "10 commandments", "commandments", "moses", "mount sinai", "what are the full 10 commandments", "full ten commandments", "list the ten commandments", "tell me the ten commandments", "tell me the full 10 commandments", "show me the ten commandments", "what are the 10 commandments", "full 10 commandments"],
    verses: [
      { reference: "Exodus 20:1-17", text: "And God spoke all these words..." },
      { reference: "Deuteronomy 5:4-21", text: "The Lord spoke with you face to face..." }
    ],
    fullText: [
      "**The Ten Commandments (NAB - Exodus 20:1-17)**",
      "Then God spoke all these words:",
      "I am the LORD your God, who brought you out of the land of Egypt, out of the house of slavery.",
      "",
      "1. You shall not have other gods beside me.",
      "",
      "2. You shall not make for yourself an idol or a likeness of anything in the heavens above or on the earth below or in the waters beneath the earth; you shall not bow down before them or serve them. For I, the LORD, your God, am a jealous God, inflicting punishment for their ancestors' wickedness on the children of those who hate me, down to the third and fourth generation; but showing love down to the thousandth generation of those who love me and keep my commandments.",
      "",
      "3. You shall not invoke the name of the LORD, your God, in vain. For the LORD will not leave unpunished anyone who invokes his name in vain.",
      "",
      "4. Remember the sabbath day—keep it holy. Six days you may labor and do all your work, but the seventh day is a sabbath of the LORD your God. You shall not do any work, either you, your son or your daughter, your male or female slave, your work animal, or the resident alien within your gates. For in six days the LORD made the heavens and the earth, the sea and all that is in them; but on the seventh day he rested. That is why the LORD has blessed the sabbath day and made it holy.",
      "",
      "5. Honor your father and your mother, that you may have a long life in the land the LORD your God is giving you.",
      "",
      "6. You shall not kill.",
      "",
      "7. You shall not commit adultery.",
      "",
      "8. You shall not steal.",
      "",
      "9. You shall not bear false witness against your neighbor.",
      "",
      "10. You shall not covet your neighbor's house. You shall not covet your neighbor's wife, his male or female slave, his ox or donkey, or anything that belongs to your neighbor."
    ],
    responses: [
      "*sits proudly* The Ten Commandments are God's special rules for living a happy, holy life! Moses received them on Mount Sinai, and they're still perfect guidance today! 📜⛰️",
      "*wags tail thoughtfully* These commandments aren't just rules - they're God's loving instructions for how to live in peace with Him and with each other! 🐕💕",
      "*bounces with excitement* Each commandment shows us how much God loves us! He gave us these guidelines to help us be truly happy and free! ✨🌟"
    ]
  }
};

// Helper functions following established patterns
export const getRandomCurriculumResponse = (grade) => {
  console.log('🔍 Getting random curriculum response for grade:', grade);
  const gradeData = catholicCurriculum[grade];
  if (!gradeData || !gradeData.responses) {
    console.log('❌ No responses found for grade:', grade);
    return null;
  }
  const randomResponse = gradeData.responses[Math.floor(Math.random() * gradeData.responses.length)];
  console.log('✅ Got random response:', randomResponse);
  return randomResponse;
};

export const findCurriculumGrade = (message) => {
  console.log('🔍 Finding curriculum grade for message:', message);
  const lowerMessage = message.toLowerCase();
  
  // Grade detection keywords
  const gradeKeywords = {
    kindergarten: ['kindergarten', 'k', 'age 5', 'age 6', 'preschool', 'kindergarten faith', 'kindergarten lesson'],
    grade1: ['grade 1', 'first grade', 'age 6', 'age 7', 'grade 1 faith', 'grade 1 lesson', 'grade1 lesson'],
    grade2: ['grade 2', 'second grade', 'age 7', 'age 8', 'first communion', 'grade 2 faith', 'grade 2 lesson', 'grade2 lesson'],
    grade3: ['grade 3', 'third grade', 'age 8', 'age 9', 'grade 3 faith', 'grade 3 lesson', 'grade3 lesson'],
    grade4: ['grade 4', 'fourth grade', 'age 9', 'age 10', 'grade 4 faith', 'grade 4 lesson', 'grade4 lesson']
  };
  
  for (const [grade, keywords] of Object.entries(gradeKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      console.log('✅ Found grade:', grade);
      return catholicCurriculum[grade];
    }
  }
  console.log('❌ No grade found');
  return null;
};

export const containsBiblePassageKeywords = (message) => {
  console.log('🔍 Checking for Bible passage keywords in message:', message);
  const lowerMessage = message.toLowerCase();
  return biblePassageResponses.keywords.some(keyword => lowerMessage.includes(keyword));
};

export const getBiblePassageResponse = () => {
  console.log('🔍 Getting Bible passage response');
  return biblePassageResponses.responses[Math.floor(Math.random() * biblePassageResponses.responses.length)];
};

export const containsCurriculumKeywords = (message) => {
  console.log('🔍 Checking for curriculum keywords in message:', message);
  const lowerMessage = message.toLowerCase();
  const curriculumKeywords = [
    'teach me', 'learn about', 'catechism', 'catholic teaching', 
    'grade', 'curriculum', 'faith formation', 'religious education'
  ];
  return curriculumKeywords.some(keyword => lowerMessage.includes(keyword));
};

// Get curriculum response with Bible integration
export const getCurriculumResponse = async (message) => {
  console.log('🔍 Getting curriculum response with Bible integration for message:', message);
  try {
    const grade = findCurriculumGrade(message);
    if (grade) {
      console.log('✅ Found grade:', grade);
      const baseResponse = getRandomCurriculumResponse(grade.grade.toLowerCase().replace(' ', ''));
      
      // Try to get a relevant Bible verse
      const { default: BibleService } = await import('../services/BibleService.js');
      if (BibleService.isAvailable() && grade.keyVerses && grade.keyVerses.length > 0) {
        console.log('🔍 Trying to get relevant Bible verse');
        const randomVerse = grade.keyVerses[Math.floor(Math.random() * grade.keyVerses.length)];
        
        try {
          const verse = await BibleService.getVerse(randomVerse);
          if (verse && verse.cleanText) {
            console.log('✅ Got Bible verse:', verse);
            return `${baseResponse}\n\n📖 "${verse.cleanText}" - ${verse.reference}`;
          }
        } catch (error) {
          console.error('Bible API failed, using fallback:', error);
          // Continue to fallback
        }
      }
      
      console.log('❌ No Bible verse found, using enhanced fallback');
      
      // Enhanced fallback with grade information
      if (grade.keyVerses && grade.keyVerses.length > 0) {
        const randomVerse = grade.keyVerses[Math.floor(Math.random() * grade.keyVerses.length)];
        return `${baseResponse}\n\n📖 **Key Scripture**: ${randomVerse}\n\n*wags tail proudly* This grade focuses on "${grade.theme}" and includes learning about ${grade.coreTopics.slice(0, 3).join(', ')}! 🐕📚✨`;
      }
      
      return `${baseResponse}\n\n*wags tail proudly* This grade focuses on "${grade.theme}" and includes learning about ${grade.coreTopics.slice(0, 3).join(', ')}! 🐕📚✨`;
    }
    console.log('❌ No grade found');
    return null;
  } catch (error) {
    console.error('Error getting curriculum response:', error);
    return null;
  }
};

// Bible Topics Helper Functions
export const containsBibleTopicKeywords = (message) => {
  console.log('🔍 Checking for Bible topic keywords in message:', message);
  const lowerMessage = message.toLowerCase();
  
  for (const [topic, data] of Object.entries(bibleTopics)) {
    if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
      console.log(`✅ Found match for topic: ${topic}`);
      return topic;
    }
  }
  console.log('❌ No topic match found');
  return null;
};

export const getBibleTopicResponse = async (message) => {
  console.log('🔍 Getting Bible topic response for message:', message);
  try {
    const topic = containsBibleTopicKeywords(message);
    if (!topic || !bibleTopics[topic]) {
      console.log('❌ No topic found');
      return null;
    }
    
    const topicData = bibleTopics[topic];
    const randomResponse = topicData.responses[Math.floor(Math.random() * topicData.responses.length)];
    
    // Special handling for Ten Commandments
    if (topic === 'tenCommandments') {
      console.log('🔍 Handling Ten Commandments topic');
      const commandmentsList = topicData.fullText.join('\n');
      return `${randomResponse}\n\n📜 **The Ten Commandments (NAB):**\n${commandmentsList}\n\n*wags tail proudly* These are God's perfect guidelines for a holy and happy life! 🐕✨`;
    }
    
    // Special handling for Prayer (include Our Father)
    if (topic === 'prayer' && topicData.ourFatherPrayer) {
      console.log('🔍 Handling Prayer topic with Our Father');
      const ourFatherText = topicData.ourFatherPrayer.join('\n');
      return `${randomResponse}\n\n🙏 **The Our Father Prayer:**\n${ourFatherText}\n\n*wags tail gently* This is the prayer Jesus taught us! It's perfect for talking to God! 🐕💕`;
    }
    
    // Try to get a relevant Bible verse from API
    const { default: BibleService } = await import('../services/BibleService.js');
    if (BibleService.isAvailable() && topicData.verses && topicData.verses.length > 0) {
      console.log('🔍 Trying to get relevant Bible verse');
      const randomVerse = topicData.verses[Math.floor(Math.random() * topicData.verses.length)];
      
      try {
        const verse = await BibleService.getVerse(randomVerse.reference);
        if (verse && verse.cleanText) {
          console.log('✅ Got Bible verse:', verse);
          return `${randomResponse}\n\n📖 "${verse.cleanText}" - ${verse.reference}\n\n*wags tail happily* Isn't God's Word wonderful? 🐕💕`;
        }
      } catch (error) {
        console.error('Bible API failed, using fallback:', error);
        // Continue to fallback
      }
    }
    
    // Fallback with local verse text
    if (topicData.verses && topicData.verses.length > 0) {
      console.log('🔍 Using fallback with local verse text');
      const randomVerse = topicData.verses[Math.floor(Math.random() * topicData.verses.length)];
      return `${randomResponse}\n\n📖 "${randomVerse.text}" - ${randomVerse.reference}\n\n*wags tail happily* Isn't God's Word wonderful? 🐕💕`;
    }
    
    console.log('❌ No verse found');
    return randomResponse;
  } catch (error) {
    console.error('Error getting Bible topic response:', error);
    return null;
  }
};

// Specific Bible Verses System
export const specificVerses = {
  'psalm 23': {
    reference: 'Psalm 23:1-6',
    title: 'The Good Shepherd',
    keywords: ['psalm 23', 'good shepherd', 'shepherd psalm', 'tell me about psalm 23', 'psalm twenty three'],
    responses: [
      "*sits peacefully* Psalm 23 is called 'The Good Shepherd' psalm! It's one of the most beautiful prayers in the whole Bible! 🐑✨",
      "*wags tail gently* This psalm teaches us that God takes care of us just like a shepherd takes care of his sheep! We're never alone! 🐕💕",
      "*tilts head thoughtfully* When King David wrote this psalm, he remembered being a shepherd boy. He knew how much shepherds love their sheep! 🌟🐑"
    ]
  },
  'john 3:16': {
    reference: 'John 3:16',
    title: 'God\'s Love for the World',
    keywords: ['john 3:16', 'god so loved the world', 'gods love'],
    responses: [
      "*bounces with pure joy* John 3:16 is called the 'Gospel in a nutshell' because it tells us everything about God's amazing love! 💕✨",
      "*wags tail excitedly* This verse tells us that God loves us SO much that He gave us His only Son, Jesus! That's the biggest gift ever! 🎁🐕",
      "*spins happily* Every time we read John 3:16, we remember that God's love is bigger than anything we can imagine! 🌟💖"
    ]
  },
  'matthew 19:14': {
    reference: 'Matthew 19:14',
    title: 'Jesus Loves Children',
    keywords: ['matthew 19:14', 'jesus loves children', 'let the children come'],
    responses: [
      "*bounces playfully* Matthew 19:14 is where Jesus says 'Let the children come to me!' He loves kids SO much! 👶✨",
      "*wags tail happily* This verse shows us that Jesus has a special place in His heart for children! You're so precious to Him! 🐕💕",
      "*spins with joy* When the disciples tried to send the children away, Jesus said 'No way!' He wanted to bless every single child! 🌟👶"
    ]
  }
};

export const containsSpecificVerseKeywords = (message) => {
  console.log('🔍 Checking for specific verse keywords in message:', message);
  const lowerMessage = message.toLowerCase();
  
  for (const [verse, data] of Object.entries(specificVerses)) {
    if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
      console.log(`✅ Found match for verse: ${verse}`);
      return verse;
    }
  }
  console.log('❌ No verse match found');
  return null;
};

export const getSpecificVerseResponse = async (message) => {
  console.log('🔍 Getting specific verse response for message:', message);
  try {
    const verse = containsSpecificVerseKeywords(message);
    if (!verse || !specificVerses[verse]) {
      console.log('❌ No verse found');
      return null;
    }
    
    const verseData = specificVerses[verse];
    const randomResponse = verseData.responses[Math.floor(Math.random() * verseData.responses.length)];
    
    // Try to get the actual verse from API
    const { default: BibleService } = await import('../services/BibleService.js');
    if (BibleService.isAvailable()) {
      console.log('🔍 Trying to get actual verse from API');
      const verseText = await BibleService.getVerse(verseData.reference);
      
      if (verseText && verseText.cleanText) {
        console.log('✅ Got verse from API:', verseText);
        return `${randomResponse}\n\n📖 "${verseText.cleanText}" - ${verseText.reference}\n\n*wags tail proudly* Isn't this verse beautiful? It's one of my favorites! 🐕💕`;
      }
    }
    
    // Fallback without API
    console.log('🔍 Fallback without API');
    return `${randomResponse}\n\n📖 ${verseData.title} - ${verseData.reference}\n\n*wags tail proudly* This is such a special verse! Would you like to learn more about it? 🐕💕`;
  } catch (error) {
    console.error('Error getting specific verse response:', error);
    return null;
  }
};

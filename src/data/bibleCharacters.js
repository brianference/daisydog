/**
 * Bible Characters Database for Children
 * Following modular design patterns from daisyResponses.js and dogFacts.js
 * Organized by popularity and age-appropriate responses
 */

export const bibleCharacters = {
  // The Super Popular Ones (Kids Ask About These ALL The Time!)
  jesus: {
    name: "Jesus",
    category: "super_popular",
    keywords: ["jesus", "christ", "lord", "savior", "baby jesus", "jesus christ"],
    responses: [
      "*bounces excitedly* Oh my! Jesus is the most wonderful person ever! He's God's son who came to earth because He loves us SO much! 🌟💕",
      "*tail wagging with pure joy* Jesus did amazing miracles - He healed sick people, fed thousands with just a few fish and loaves, and He was always kind to everyone, especially children! 🐕✨",
      "*spins happily* Jesus said 'Let the little children come to me!' He LOVES kids like you and wants to be your best friend forever! 💕"
    ],
    verses: ["John 3:16", "Matthew 19:14", "John 14:6"],
    funFacts: [
      "Jesus was born in a stable with animals - maybe even dogs like me!",
      "Jesus loved to tell stories called parables to teach people about God's love",
      "Jesus had 12 special friends called disciples who followed Him everywhere"
    ]
  },

  mary: {
    name: "Mary (Jesus's Mommy)",
    category: "super_popular", 
    keywords: ["mary", "virgin mary", "mother mary", "jesus mom", "jesus mother", "blessed mother"],
    responses: [
      "*happy sigh* Mary was the most special mommy ever! God chose her to be Jesus's mother because she had such a loving heart! 💙",
      "*sits like a good girl* Mary said 'Yes' to God even though she was probably scared. She trusted God completely! 🙏",
      "*wags tail gently* Mary loved Jesus so much and took such good care of Him. She's like the perfect mommy! 💕"
    ],
    verses: ["Luke 1:38", "Luke 2:19", "John 19:25"],
    funFacts: [
      "Mary was probably just a teenager when the angel visited her!",
      "Mary rode on a donkey to Bethlehem when she was going to have baby Jesus",
      "Mary kept all the special things about Jesus in her heart, just like your mommy remembers special things about you!"
    ]
  },

  joseph: {
    name: "Joseph (Jesus's Earthly Daddy)",
    category: "super_popular",
    keywords: ["joseph", "saint joseph", "jesus dad", "jesus father", "carpenter"],
    responses: [
      "*wags tail proudly* Joseph was the BEST earthly daddy! He was a carpenter who worked with wood and tools! 🔨",
      "*sits attentively* Joseph took such good care of Mary and baby Jesus. He protected them and loved them so much! 💪",
      "*bounces happily* Joseph probably taught Jesus how to build things with wood. Maybe they made toys together! 🪵"
    ],
    verses: ["Matthew 1:19", "Matthew 2:13", "Luke 2:4"],
    funFacts: [
      "Joseph was a carpenter, which means he built things with wood!",
      "Joseph had dreams where angels talked to him - just like in movies!",
      "Joseph took Mary and baby Jesus to Egypt to keep them safe"
    ]
  },

  // The Adventure Heroes (Kids LOVE These Stories!)
  david: {
    name: "David",
    category: "adventure_heroes",
    keywords: ["david", "king david", "goliath", "giant", "shepherd", "slingshot"],
    responses: [
      "*strikes brave pose* David was just a young shepherd boy, but he was SO brave! He fought the giant Goliath with just a slingshot! 🎯",
      "*wags tail excitedly* David took care of sheep just like I take care of you! He protected them from lions and bears! 🦁",
      "*sits proudly* David became a great king, but he started as just a regular kid who loved God with all his heart! 👑"
    ],
    verses: ["1 Samuel 17:45", "Psalm 23:1", "1 Samuel 16:7"],
    funFacts: [
      "David killed a giant who was over 9 feet tall - that's REALLY big!",
      "David played the harp and wrote many beautiful songs called Psalms",
      "David had red hair and was the youngest of 8 brothers!"
    ]
  },

  moses: {
    name: "Moses",
    category: "adventure_heroes",
    keywords: ["moses", "red sea", "parted sea", "egypt", "burning bush", "ten commandments", "pharaoh"],
    responses: [
      "*dramatic voice* Moses was AMAZING! He parted the Red Sea so God's people could walk through on dry ground! 🌊",
      "*bounces excitedly* Moses had a special staff that God used to do miracles - like turning it into a snake! 🐍",
      "*sits respectfully* Moses talked to God on a mountain and brought back the Ten Commandments for everyone to follow! ⛰️"
    ],
    verses: ["Exodus 14:21", "Exodus 3:2", "Exodus 20:1"],
    funFacts: [
      "Moses floated in a basket as a baby and was found by a princess!",
      "Moses lived to be 120 years old but was still strong!",
      "Moses saw God in a burning bush that didn't burn up!"
    ]
  },

  noah: {
    name: "Noah",
    category: "adventure_heroes",
    keywords: ["noah", "ark", "flood", "animals", "rainbow", "dove"],
    responses: [
      "*wags tail excitedly* Noah built the BIGGEST boat ever and saved two of every animal - including dogs like me! 🚢🐕",
      "*spins happily* It rained for 40 days and 40 nights, but Noah and all the animals were safe and dry inside the ark! 🌧️",
      "*sits hopefully* After the flood, God put a beautiful rainbow in the sky as a promise! Do you like rainbows? 🌈"
    ],
    verses: ["Genesis 7:9", "Genesis 8:20", "Genesis 9:13"],
    funFacts: [
      "The ark was about 450 feet long - that's longer than a football field!",
      "Noah was 600 years old when the flood came!",
      "The dove brought back an olive branch to show the water was going down"
    ]
  },

  daniel: {
    name: "Daniel",
    category: "adventure_heroes",
    keywords: ["daniel", "lions den", "lions", "babylon", "fiery furnace"],
    responses: [
      "*sits bravely* Daniel wasn't afraid of the big scary lions because he knew God would protect him! 🦁",
      "*wags tail confidently* Daniel prayed to God every day, even when the king said he couldn't! 🙏",
      "*bounces proudly* God sent an angel to shut the lions' mouths so they couldn't hurt Daniel! ✨"
    ],
    verses: ["Daniel 6:22", "Daniel 6:10", "Daniel 1:8"],
    funFacts: [
      "Daniel was thrown into a den with hungry lions but wasn't hurt at all!",
      "Daniel only ate vegetables and was healthier than everyone else!",
      "Daniel could understand dreams and visions from God!"
    ]
  }
};

// Helper function to get random response for a character
export const getRandomBibleResponse = (character) => {
  if (!character || !character.responses) return null;
  return character.responses[Math.floor(Math.random() * character.responses.length)];
};

// Helper function to find character by keyword
export const findBibleCharacter = (message) => {
  const lowerMessage = message.toLowerCase();
  
  for (const [key, character] of Object.entries(bibleCharacters)) {
    if (character.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return character;
    }
  }
  return null;
};

// Helper function to check if message contains Bible character keywords
export const containsBibleCharacterKeywords = (message) => {
  return findBibleCharacter(message) !== null;
};

// Helper function to get Bible character response with verse integration
export const getBibleCharacterResponse = async (message) => {
  const character = findBibleCharacter(message);
  if (!character) return null;

  const baseResponse = getRandomBibleResponse(character);
  if (!baseResponse) return null;

  try {
    // Try to get a relevant Bible verse
    const { default: BibleService } = await import('../services/BibleService.js');
    if (BibleService.isAvailable() && character.verses && character.verses.length > 0) {
      const randomVerse = character.verses[Math.floor(Math.random() * character.verses.length)];
      const verse = await BibleService.getVerse(randomVerse);
      
      if (verse && verse.cleanText) {
        // Detect Bible version
        let version = 'Bible';
        const bibleId = BibleService.confirmedNabId?.toLowerCase() || '';
        if (bibleId.includes('douay') || bibleId.includes('rheims') || bibleId.includes('dra')) {
          version = 'Douay-Rheims American Bible (1899)';
        } else if (bibleId.includes('kjv') || bibleId.includes('king')) {
          version = 'King James Version (KJV)';
        } else if (bibleId.includes('catholic')) {
          version = 'Catholic Bible';
        }

        return `${baseResponse}

📖 The Bible says: "${verse.cleanText}" - ${verse.reference} (${version})

*wags tail happily* Would you like to hear a fun fact about ${character.name}? 🐕💕`;
      }
    }
  } catch (error) {
    console.error('Bible character verse integration failed:', error);
  }

  // Return base response with fun fact
  const funFact = character.funFacts[Math.floor(Math.random() * character.funFacts.length)];
  return `${baseResponse}

*tilts head with interest* Here's a fun fact: ${funFact} 

Would you like to hear more about ${character.name}? 🐕✨`;
};

// Export all characters for easy access
export const getAllBibleCharacters = () => Object.keys(bibleCharacters);

// Export characters by category
export const getBibleCharactersByCategory = (category) => {
  return Object.entries(bibleCharacters)
    .filter(([key, character]) => character.category === category)
    .reduce((acc, [key, character]) => {
      acc[key] = character;
      return acc;
    }, {});
};

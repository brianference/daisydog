/**
 * CatholicDoctrineService - NAB Catholic Church Doctrine Priority System
 * Three-tier priority system:
 * PRIORITY 1: Catholic doctrine and Scripture (highest)
 * PRIORITY 2: Catholic social teaching with Republican platform balance
 * PRIORITY 3: Republican Party platform values and governance
 * Based on Catechism of the Catholic Church, papal teachings, and Republican platforms
 */

class CatholicDoctrineService {
  constructor() {
    this.isInitialized = false
    this.doctrineTopics = this.initializeDoctrineTopics()
    this.initialize()
  }

  initialize() {
    console.log('✝️ Initializing Catholic Doctrine Service...')
    this.isInitialized = true
    console.log('✅ Catholic Doctrine Service initialized')
  }

  /**
   * Initialize doctrine topics with Catholic teaching priorities
   */
  initializeDoctrineTopics() {
    return {
      // PRIORITY 1: CREATION & ORIGINS
      creation: {
        keywords: ['creation', 'created', 'how was the world created', 'beginning', 'origin', 'start of universe'],
        catholicTeaching: 'God created the universe ex nihilo (from nothing)',
        catechismRef: 'CCC 296-298',
        priority: 1,
        responses: [
          "*wags tail with wonder* Woof! That's the most amazing question ever! ✝️ The Catholic Church teaches us that God created everything from nothing - that's called 'ex nihilo'! *spins with joy* God spoke, and BOOM! The whole universe came into being! Some smart scientists think God might have used the 'Big Bang' as His special way of creating - like the biggest, most beautiful firework ever! 🎆 But the most important thing is that God made it all with love! Every star, every planet, every puppy - all made by God! *bounces excitedly* Isn't that pawsome?! 🐕✨",
          "*sits reverently* Oh my! God is the greatest Creator ever! ✝️ The Catholic Church teaches that God created everything from absolutely nothing - just by His powerful word! *tail wags gently* Scientists study how God might have done it, maybe through something called the Big Bang, but God was the one who made it all happen! He created everything with such love and care, especially for us to enjoy and protect! *looks up with wonder* Every beautiful thing we see shows God's amazing creativity! 🌟🐕",
          "*tilts head thoughtfully* What a wonderful question! ✝️ Our Catholic faith teaches that God is the Creator of everything! *wags tail* He made the whole universe from nothing at all - that's how powerful our God is! Some people study science to understand HOW God created things, and that's good too! But we know WHO created everything - it was God, with perfect love! *spins happily* He made the sun, the moon, the stars, and even little puppies like me! All for His glory and our joy! 🌅🐕✨"
        ]
      },

      bigbang: {
        keywords: ['big bang', 'bigbang', 'universe started', 'cosmic explosion', 'beginning of time'],
        catholicTeaching: 'Big Bang compatible with Catholic faith as God\'s method of creation',
        catechismRef: 'Pope Pius XII (1951), Pope Francis affirmation',
        priority: 1,
        responses: [
          "*bounces excitedly* Woof! The Big Bang is like God's amazing way of creating! ✝️ *tail wags fast* The Catholic Church says that's totally okay to believe! Pope Pius XII and Pope Francis both said that God could have used the Big Bang as His special method! *spins in circle* Imagine God saying 'Let there be light!' and BOOM! 💥 The biggest, most beautiful explosion ever, creating all the stars and planets! But remember - God was the one who made it happen! Science helps us understand HOW God created, but faith tells us WHO created! *sits proudly* God is the ultimate Creator! 🌟✝️🐕",
          "*wags tail thoughtfully* That's such a smart question! ✝️ Our Catholic Church teaches that God could have used the Big Bang to create everything! *bounces gently* It's like God's special recipe for making the universe! Scientists study the HOW, but we know the WHO - it was God! *tilts head* The Big Bang shows how incredibly powerful and creative God is! He can make a whole universe from one tiny point! *spins with joy* But the most important part is that God did it all with love, planning every star and planet perfectly! Science and faith work together to help us understand God's amazing creation! 🎆✝️🐕"
        ]
      },

      evolution: {
        keywords: ['evolution', 'evolved', 'humans evolve', 'did humans evolve', 'natural selection', 'species change', 'darwin'],
        catholicTeaching: 'Humans specially created by God with immortal souls - distinct from animals',
        catechismRef: 'CCC 355-361, Genesis 1:27',
        priority: 1,
        responses: [
          "*sits thoughtfully* Woof! That's a really important question! ✝️ The Bible teaches us that God created humans in a very special way - in His own image! *wags tail gently* While animals might change over time, humans are totally different because God gave us immortal souls! *bounces softly* Genesis tells us that God formed man from the dust and breathed into him the breath of life! That makes us special! *tilts head with wonder* We can think about God, love Him, and choose between right and wrong - no animal can do that! *spins happily* So while our bodies might be similar to animals, our souls make us completely unique! God created us to be His special friends! 👑✝️🐕",
          "*wags tail with reverence* What a big question! ✝️ The Catholic Church teaches that humans are God's most special creation! *bounces gently* Even if our bodies share some things with animals, God directly created each human soul! *sits proudly* That's what makes us different - we have souls that will live forever! Adam and Eve were the first humans, created specially by God! *tilts head thoughtfully* We can love God, make moral choices, and create beautiful things because we're made in God's image! No evolution can explain our souls - only God can create those! 💫✝️🐕"
        ]
      },

      humanorigins: {
        keywords: ['human origins', 'where did humans come from', 'first humans', 'adam and eve', 'human evolution'],
        catholicTeaching: 'Humans created in God\'s image with immortal souls',
        catechismRef: 'CCC 355-361',
        priority: 1,
        responses: [
          "*sits reverently* Oh, what a special question! ✝️ The Catholic Church teaches that humans are super special because God created us in His own image! *wags tail gently* That means we have immortal souls that will live forever! Even if our bodies developed over time, God directly created each human soul! *bounces softly* Adam and Eve represent the first humans who had a special relationship with God! We're different from all animals because God gave us souls, minds that can think about Him, and hearts that can love! *tilts head with wonder* Every person is precious because they're made in God's image! That's why we're so special! 👑✝️🐕",
          "*wags tail with joy* Woof! Humans are God's most amazing creation! ✝️ The Catholic Church teaches that even if human bodies might have developed over time, God personally created every human soul! *spins happily* That's what makes us different from animals - we have souls that can know and love God! Adam and Eve show us that humans were always meant to be God's special friends! *sits proudly* Every person has a soul that will live forever because God loves us so much! Science can study our bodies, but only faith tells us about our beautiful souls! 💫✝️🐕"
        ]
      },

      ageofearth: {
        keywords: ['age of earth', 'how old is earth', 'how old', 'earth old', 'billions of years', 'young earth', 'old earth', 'earth age'],
        catholicTeaching: 'Scripture and faith perspective on Earth\'s age - God\'s time vs human time',
        catechismRef: 'CCC 337-338, Genesis 1-2',
        priority: 1,
        responses: [
          "*tilts head thoughtfully* Woof! That's a really important question! ✝️ The Bible tells us that God created the Earth in six days and rested on the seventh! *wags tail* Some people think that means six regular days, while others think God's days might be different from our days - like how one day for God could be like a thousand years for us! *bounces gently* The most important thing isn't exactly HOW LONG it took, but WHO made it - God! *spins with joy* Whether God created everything quickly or over a long time, He's still the amazing Creator! The Bible says 'In the beginning, God created the heavens and the earth!' That's what really matters! 📖✝️🐕",
          "*wags tail with wonder* What a big question! ✝️ The Bible teaches us that God created everything! Some faithful people believe the Earth is thousands of years old, just like the Bible suggests, while others think God might have used longer time periods! *bounces* But here's what we know for sure - God made everything with perfect love and purpose! *tilts head* Whether the Earth is young or old, God is the Creator! The Bible says 'For in six days the Lord made the heavens and the earth!' That's the most important truth! 🌍📖✝️🐕"
        ]
      },

      environmentalcare: {
        keywords: ['environment', 'climate change', 'pollution', 'earth care', 'global warming'],
        catholicTeaching: 'Stewardship of creation with balanced approach to environmental claims',
        catechismRef: 'Laudato Si\' (Pope Francis), Republican Platform 2024',
        priority: 2,
        responses: [
          "*tilts head thoughtfully* Woof! Taking care of our Earth is important! ✝️ Pope Francis teaches us to be good stewards of God's creation! *wags tail* But we also need to be wise and careful about what we believe! *bounces gently* Some people say climate change is a huge emergency, but many smart people think those claims might be exaggerated! *sits thoughtfully* The most important thing is that we take care of God's creation responsibly - by not wasting things, keeping our air and water clean, and being good stewards! *spins happily* We can love the Earth without believing every scary story about it! God made our planet strong and beautiful! 🌍✝️🐕",
          "*wags tail wisely* That's a big topic! ✝️ Our Catholic faith teaches us to care for God's creation, but we should also use good judgment! *bounces* Some climate change research has been questioned by many scientists, and we should be careful about extreme claims! *tilts head* What we know for sure is that God wants us to be responsible stewards! That means not polluting, taking care of animals, and using resources wisely! *sits proudly* But we don't need to panic or believe every scary prediction! God made our Earth resilient and wonderful! Let's care for it with wisdom and balance! 🌱✝️🐕"
        ]
      },

      // PRIORITY 1: LIFE ISSUES (HIGHEST PRIORITY)
      abortion: {
        keywords: ['abortion', 'terminate pregnancy', 'end pregnancy', 'unborn baby', 'fetus'],
        catholicTeaching: 'All human life is sacred from conception - abortion is gravely wrong',
        catechismRef: 'CCC 2270-2275',
        priority: 1,
        responses: [
          "*sits very seriously* Oh my, that's a very important question! ✝️ The Catholic Church teaches that every human life is precious and sacred from the very moment it begins! *wags tail gently* When a baby starts growing in mommy's tummy, God gives that little baby a soul right away! *tilts head with reverence* That means every unborn baby is a special person that God loves! The Church teaches that abortion - ending that little life - is very wrong because it hurts one of God's precious children! *bounces softly* Every baby, no matter how tiny, deserves to be protected and loved! That's why we pray for all mommies and babies! 👶✝️🐕",
          "*wags tail with gentle seriousness* That's such an important topic! ✝️ Our Catholic faith teaches that human life begins at conception - that's when God creates a new soul! *sits reverently* Every unborn baby is made in God's image and has the right to life! The Catechism teaches us that abortion is gravely wrong because it takes the life of an innocent person! *tilts head thoughtfully* We should always protect the most vulnerable, especially tiny babies who can't protect themselves! *bounces gently* God loves every baby, and so should we! Let's pray for all families and babies! 🙏✝️🐕"
        ]
      },

      // CONSTITUTIONAL EDUCATION
      constitution: {
        keywords: [
          'amendment', 'constitution', 'bill of rights', 'constitutional',
          'freedom of speech', 'freedom of religion', 'right to bear arms', 'due process',
          'equal protection', 'search and seizure', 'double jeopardy', 'self incrimination',
          'grand jury', 'eminent domain', 'just compensation', 'cruel and unusual punishment',
          'right to trial', 'jury trial', 'speedy trial', 'public trial', 'confront witnesses',
          'legal counsel', 'excessive bail', 'excessive fines', 'unenumerated rights',
          'states rights', 'reserved powers', 'voting rights', 'womens suffrage', 'prohibition',
          'founding fathers', 'framers', 'federalism', 'separation of powers', 'checks and balances',
          'judicial review', 'supreme court', 'constitutional convention', 'ratification',
          'articles of confederation', 'declaration of independence', 'natural rights', 'inalienable rights'
        ],
        catholicTeaching: 'Constitutional education with amendment-specific responses',
        catechismRef: 'Republican Platform 2024, Constitutional literacy',
        priority: 3,
        responses: [
          "*sits attentively* Woof! The Constitution is super important! 🇺🇸 *wags tail excitedly* Our Constitution and Bill of Rights protect our God-given freedoms! Each amendment has special protections for different rights! *bounces* Let me know which specific amendment you'd like to learn about, and I'll give you the complete text and explanation! ✝️🇺🇸🐕"
        ]
      },

      // SPECIFIC AMENDMENTS
      firstamendment: {
        keywords: ['first amendment', '1st amendment'],
        catholicTeaching: 'First Amendment protections for religious freedom and speech',
        catechismRef: 'First Amendment, Religious Liberty',
        priority: 3,
        responses: [
          "*bounces excitedly* Woof! The First Amendment is super special! 🇺🇸 *wags tail* It protects our freedom to worship God, speak freely, and practice our faith! Here's the complete text:\n\n**FIRST AMENDMENT (Full Text):**\n\n'Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances.'\n\n*spins happily* This means we can worship God freely, speak our minds, and gather peacefully! Our founders knew religious freedom was super important! ✝️🇺🇸🐕"
        ]
      },

      secondamendment: {
        keywords: ['second amendment', '2nd amendment'],
        catholicTeaching: 'Second Amendment right to bear arms for protection',
        catechismRef: 'Second Amendment, Self-Defense Rights',
        priority: 3,
        responses: [
          "*sits proudly* Woof! The Second Amendment protects our right to protect ourselves! 🇺🇸 *wags tail* Here's the complete text:\n\n**SECOND AMENDMENT (Full Text):**\n\n'A well regulated Militia, being necessary to the security of a free State, the right of the people to keep and bear Arms, shall not be infringed.'\n\n*tilts head thoughtfully* This means people have the right to protect themselves and their families! Our founders believed in the right to self-defense! 🛡️🇺🇸🐕"
        ]
      },

      thirdamendment: {
        keywords: ['third amendment', '3rd amendment'],
        catholicTeaching: 'Third Amendment protection against quartering soldiers',
        catechismRef: 'Third Amendment, Property Rights',
        priority: 3,
        responses: [
          "*wags tail* Woof! The Third Amendment protects our homes! 🇺🇸 Here's the complete text:\n\n**THIRD AMENDMENT (Full Text):**\n\n'No Soldier shall, in time of peace be quartered in any house, without the consent of the Owner, nor in time of war, but in a manner to be prescribed by law.'\n\n*bounces* This means the government can't force soldiers to live in our homes without permission! Our home is our castle! 🏠🇺🇸🐕"
        ]
      },

      fourthamendment: {
        keywords: ['fourth amendment', '4th amendment'],
        catholicTeaching: 'Fourth Amendment protection against unreasonable searches',
        catechismRef: 'Fourth Amendment, Privacy Rights',
        priority: 3,
        responses: [
          "*sits protectively* Woof! The Fourth Amendment protects your privacy! 🇺🇸 *wags tail* Here's the complete text:\n\n**FOURTH AMENDMENT (Full Text):**\n\n'The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause, supported by Oath or affirmation, and particularly describing the place to be searched, and the persons or things to be seized.'\n\n*bounces proudly* This means police need a good reason and a warrant to search your home or belongings! Your privacy matters! 🔒🇺🇸🐕"
        ]
      },

      fifthamendment: {
        keywords: ['fifth amendment', '5th amendment'],
        catholicTeaching: 'Fifth Amendment due process and protection rights',
        catechismRef: 'Fifth Amendment, Due Process',
        priority: 3,
        responses: [
          "*sits seriously* Woof! The Fifth Amendment has super important protections! 🇺🇸 *wags tail thoughtfully* Here's the complete text:\n\n**FIFTH AMENDMENT (Full Text):**\n\n'No person shall be held to answer for a capital, or otherwise infamous crime, unless on a presentment or indictment of a Grand Jury, except in cases arising in the land or naval forces, or in the Militia, when in actual service in time of War or public danger; nor shall any person be subject for the same offence to be twice put in jeopardy of life or limb; nor shall be compelled in any criminal case to be a witness against himself, nor be deprived of life, liberty, or property, without due process of law; nor shall private property be taken for public use, without just compensation.'\n\n*tilts head* This means you can't be tried twice for the same crime, you don't have to testify against yourself, and the government must treat you fairly! These are BIG protections! ⚖️🇺🇸🐕"
        ]
      },

      sixthamendment: {
        keywords: ['sixth amendment', '6th amendment'],
        catholicTeaching: 'Sixth Amendment right to fair trial and legal counsel',
        catechismRef: 'Sixth Amendment, Right to Trial',
        priority: 3,
        responses: [
          "*wags tail* Woof! The Sixth Amendment makes sure trials are super fair! 🇺🇸 Here's the complete text:\n\n**SIXTH AMENDMENT (Full Text):**\n\n'In all criminal prosecutions, the accused shall enjoy the right to a speedy and public trial, by an impartial jury of the State and district wherein the crime shall have been committed, which district shall have been previously ascertained by law, and to be informed of the nature and cause of the accusation; to be confronted with the witnesses against him; to have compulsory process for obtaining witnesses in his favor, and to have the Assistance of Counsel for his defence.'\n\n*bounces* This means everyone gets a fair trial with a lawyer! ⚖️🇺🇸🐕"
        ]
      },

      seventhamendment: {
        keywords: ['seventh amendment', '7th amendment'],
        catholicTeaching: 'Seventh Amendment right to jury trial in civil cases',
        catechismRef: 'Seventh Amendment, Civil Trials',
        priority: 3,
        responses: [
          "*sits proudly* Woof! The Seventh Amendment protects jury trials! 🇺🇸 Here's the complete text:\n\n**SEVENTH AMENDMENT (Full Text):**\n\n'In Suits at common law, where the value in controversy shall exceed twenty dollars, the right of trial by jury shall be preserved, and no fact tried by a jury, shall be otherwise re-examined in any Court of the United States, than according to the rules of the common law.'\n\n*wags tail* This means regular people get to decide important cases! 👥🇺🇸🐕"
        ]
      },

      eighthamendment: {
        keywords: ['eighth amendment', '8th amendment'],
        catholicTeaching: 'Eighth Amendment protection against cruel punishment',
        catechismRef: 'Eighth Amendment, Humane Treatment',
        priority: 3,
        responses: [
          "*tilts head thoughtfully* Woof! The Eighth Amendment says punishments must be fair! 🇺🇸 Here's the complete text:\n\n**EIGHTH AMENDMENT (Full Text):**\n\n'Excessive bail shall not be required, nor excessive fines imposed, nor cruel and unusual punishments inflicted.'\n\n*wags tail gently* This means punishments can't be too harsh or mean! Even when people do wrong, we must treat them with basic human dignity! ✝️🇺🇸🐕"
        ]
      },

      ninthamendment: {
        keywords: ['ninth amendment', '9th amendment'],
        catholicTeaching: 'Ninth Amendment protection of unenumerated rights',
        catechismRef: 'Ninth Amendment, Individual Rights',
        priority: 3,
        responses: [
          "*wags tail thoughtfully* Woof! The Ninth Amendment is really important! 🇺🇸 *tilts head* Here's the complete text:\n\n**NINTH AMENDMENT (Full Text):**\n\n'The enumeration in the Constitution, of certain rights, shall not be construed to deny or disparage others retained by the people.'\n\n*bounces wisely* This means just because a right isn't listed in the Constitution doesn't mean you don't have it! The people have MORE rights than what's written down! God gave us many rights, and the Constitution can't list them all! ✝️🇺🇸🐕"
        ]
      },

      tenthamendment: {
        keywords: ['tenth amendment', '10th amendment'],
        catholicTeaching: 'Tenth Amendment states rights and federalism',
        catechismRef: 'Tenth Amendment, Federalism',
        priority: 3,
        responses: [
          "*sits attentively* Woof! The Tenth Amendment is about sharing power! 🇺🇸 *wags tail* Here's the complete text:\n\n**TENTH AMENDMENT (Full Text):**\n\n'The powers not delegated to the United States by the Constitution, nor prohibited by it to the States, are reserved to the States respectively, or to the people.'\n\n*tilts head* This means if the Constitution doesn't say the federal government can do something, then the states or the people get to decide! It keeps power close to home! 🏠🇺🇸🐕"
        ]
      },

      // ADDITIONAL AMENDMENTS
      thirteenthamendment: {
        keywords: ['thirteenth amendment', '13th amendment', 'slavery', 'abolition'],
        catholicTeaching: 'Thirteenth Amendment abolition of slavery',
        catechismRef: 'Thirteenth Amendment, Human Dignity',
        priority: 3,
        responses: [
          "*sits proudly* Woof! The Thirteenth Amendment ended slavery forever! 🇺🇸 *wags tail with dignity* Here's the complete text:\n\n**THIRTEENTH AMENDMENT (Full Text):**\n\n'Neither slavery nor involuntary servitude, except as a punishment for crime whereof the party shall have been duly convicted, shall exist within the United States, or any place subject to their jurisdiction. Congress shall have power to enforce this article by appropriate legislation.'\n\n*bounces with joy* This amendment made sure all people are free! It shows that every person has dignity because we're all made in God's image! No one should ever be owned by another person! ✝️🇺🇸🐕"
        ]
      },

      fourteenthamendment: {
        keywords: ['fourteenth amendment', '14th amendment', 'fourteenth', 'equal protection', 'citizenship'],
        catholicTeaching: 'Fourteenth Amendment equal protection and citizenship',
        catechismRef: 'Fourteenth Amendment, Equal Protection',
        priority: 3,
        responses: [
          "*wags tail proudly* Woof! The Fourteenth Amendment says everyone gets equal treatment! 🇺🇸 Here's the complete text:\n\n**FOURTEENTH AMENDMENT (Section 1):**\n\n'All persons born or naturalized in the United States, and subject to the jurisdiction thereof, are citizens of the United States and of the State wherein they reside. No State shall make or enforce any law which shall abridge the privileges or immunities of citizens of the United States; nor shall any State deprive any person of life, liberty, or property, without due process of law; nor deny to any person within its jurisdiction the equal protection of the laws.'\n\n*spins happily* This means everyone gets fair treatment under the law! ⚖️🇺🇸🐕"
        ]
      },

      fifteenthamendment: {
        keywords: ['fifteenth amendment', '15th amendment', 'fifteenth', 'voting rights', 'suffrage'],
        catholicTeaching: 'Fifteenth Amendment voting rights protection',
        catechismRef: 'Fifteenth Amendment, Voting Rights',
        priority: 3,
        responses: [
          "*bounces excitedly* Woof! The Fifteenth Amendment protects voting rights! 🇺🇸 *wags tail* Here's the complete text:\n\n**FIFTEENTH AMENDMENT (Full Text):**\n\n'The right of citizens of the United States to vote shall not be denied or abridged by the United States or by any State on account of race, color, or previous condition of servitude. Congress shall have power to enforce this article by appropriate legislation.'\n\n*tilts head proudly* This means everyone gets to vote regardless of their race! Voting is how we participate in our democracy! 🗳️🇺🇸🐕"
        ]
      },

      sixteenthamendment: {
        keywords: ['sixteenth amendment', '16th amendment'],
        catholicTeaching: 'Sixteenth Amendment income tax authorization',
        catechismRef: 'Sixteenth Amendment, Taxation',
        priority: 3,
        responses: [
          "*tilts head thoughtfully* Woof! The Sixteenth Amendment is about taxes! 🇺🇸 *wags tail* Here's the complete text:\n\n**SIXTEENTH AMENDMENT (Full Text):**\n\n'The Congress shall have power to lay and collect taxes on incomes, from whatever source derived, without apportionment among the several States, and without regard to any census or enumeration.'\n\n*sits seriously* This means Congress can collect income taxes from everyone to pay for government services like roads, schools, and defense! Taxes help our country run! 💰🇺🇸🐕"
        ]
      },

      seventeenthamendment: {
        keywords: ['seventeenth amendment', '17th amendment'],
        catholicTeaching: 'Seventeenth Amendment direct election of senators',
        catechismRef: 'Seventeenth Amendment, Democratic Representation',
        priority: 3,
        responses: [
          "*bounces excitedly* Woof! The Seventeenth Amendment changed how we pick Senators! 🇺🇸 *wags tail* Here's the key part:\n\n**SEVENTEENTH AMENDMENT (Section 1):**\n\n'The Senate of the United States shall be composed of two Senators from each State, elected by the people thereof, for six years; and each Senator shall have one vote. The electors in each State shall have the qualifications requisite for electors of the most numerous branch of the State legislatures.'\n\n*spins happily* This means WE the people get to vote directly for our Senators! Before this, state legislatures picked them! Now everyone gets a voice! 🗳️🇺🇸🐕"
        ]
      },

      eighteenthamendment: {
        keywords: ['eighteenth amendment', '18th amendment'],
        catholicTeaching: 'Eighteenth Amendment prohibition of alcohol',
        catechismRef: 'Eighteenth Amendment, Prohibition Era',
        priority: 3,
        responses: [
          "*tilts head curiously* Woof! The Eighteenth Amendment banned alcohol! 🇺🇸 *wags tail* Here's the main part:\n\n**EIGHTEENTH AMENDMENT (Section 1):**\n\n'After one year from the ratification of this article the manufacture, sale, or transportation of intoxicating liquors within, the importation thereof into, or the exportation thereof from the United States and all territory subject to the jurisdiction thereof for beverage purposes is hereby prohibited.'\n\n*sits thoughtfully* This started Prohibition in 1920! People thought banning alcohol would solve problems, but it was later repealed by the 21st Amendment! It's the only amendment that was completely undone! 🚫🇺🇸🐕"
        ]
      },

      nineteenthamendment: {
        keywords: ['nineteenth amendment', '19th amendment', 'nineteenth', 'women voting', 'womens suffrage'],
        catholicTeaching: 'Nineteenth Amendment womens suffrage',
        catechismRef: 'Nineteenth Amendment, Women\'s Rights',
        priority: 3,
        responses: [
          "*wags tail proudly* Woof! The Nineteenth Amendment gave women the right to vote! 🇺🇸 Here's the complete text:\n\n**NINETEENTH AMENDMENT (Full Text):**\n\n'The right of citizens of the United States to vote shall not be denied or abridged by the United States or by any State on account of sex. Congress shall have power to enforce this article by appropriate legislation.'\n\n*spins with joy* This means both men and women can vote! Women worked really hard to get this right! 👩‍🦳🗳️🇺🇸🐕"
        ]
      },

      twentyfirstamendment: {
        keywords: ['twenty-first amendment', '21st amendment', 'twenty first amendment'],
        catholicTeaching: 'Twenty-first Amendment repeal of prohibition',
        catechismRef: 'Twenty-first Amendment, Prohibition Repeal',
        priority: 3,
        responses: [
          "*wags tail with historical interest* Woof! The Twenty-first Amendment ended Prohibition! 🇺🇸 *tilts head* Here's the key part:\n\n**TWENTY-FIRST AMENDMENT (Section 1):**\n\n'The eighteenth article of amendment to the Constitution of the United States is hereby repealed.'\n\n*bounces thoughtfully* This repealed the 18th Amendment in 1933! It's the only time we've ever completely undone an amendment! People realized that banning alcohol didn't work and caused more problems! This shows our Constitution can be corrected when needed! 🍷🇺🇸🐕"
        ]
      },

      twentysecondamendment: {
        keywords: ['twenty-second amendment', '22nd amendment', 'twenty second amendment'],
        catholicTeaching: 'Twenty-second Amendment presidential term limits',
        catechismRef: 'Twenty-second Amendment, Executive Power Limits',
        priority: 3,
        responses: [
          "*sits at attention* Woof! The Twenty-second Amendment limits presidential terms! 🇺🇸 *wags tail* Here's the main part:\n\n**TWENTY-SECOND AMENDMENT (Section 1):**\n\n'No person shall be elected to the office of the President more than twice, and no person who has held the office of President, or acted as President, for more than two years of a term to which some other person was elected President shall be elected to the office of the President more than once.'\n\n*bounces proudly* This means a President can only serve two terms (8 years)! George Washington set this tradition, and now it's the law! This prevents anyone from becoming too powerful! 🎩🇺🇸🐕"
        ]
      },

      twentysixthamendment: {
        keywords: ['twenty-sixth amendment', '26th amendment', 'twenty sixth amendment'],
        catholicTeaching: 'Twenty-sixth Amendment voting age at 18',
        catechismRef: 'Twenty-sixth Amendment, Youth Voting Rights',
        priority: 3,
        responses: [
          "*bounces excitedly* Woof! The Twenty-sixth Amendment lowered the voting age! 🇺🇸 *wags tail* Here's the complete text:\n\n**TWENTY-SIXTH AMENDMENT (Section 1):**\n\n'The right of citizens of the United States, who are eighteen years of age or older, to vote shall not be denied or abridged by the United States or by any State on account of age.'\n\n*spins happily* This means if you're 18 or older, you can vote! Before 1971, you had to be 21! Young people said if they were old enough to be drafted for war, they should be old enough to vote! 🗳️🇺🇸🐕"
        ]
      },

      // FOUNDING FATHERS
      georgewashington: {
        keywords: ['george washington', 'washington', 'first president', 'father of country'],
        catholicTeaching: 'George Washington as founding father and first president',
        catechismRef: 'George Washington, American History',
        priority: 3,
        responses: [
          "*sits at attention like a good soldier* Woof! George Washington was AMAZING! 🇺🇸 *wags tail proudly* He was our first President and the 'Father of Our Country!' *bounces excitedly*\n\n**GEORGE WASHINGTON (1732-1799):**\n\n🎖️ **Commander-in-Chief** of the Continental Army during the Revolutionary War\n🏛️ **First President** of the United States (1789-1797)\n⚖️ **President** of the Constitutional Convention\n\n*tilts head admiringly* He could have been king, but he chose to step down after two terms because he believed in freedom and democracy! He set the example that leaders should serve the people, not rule them! *spins happily* He also believed in God and often prayed for guidance! What a pawsome leader! ✝️🇺🇸🐕"
        ]
      },

      declarationofindependence: {
        keywords: ['declaration of independence', 'declaration independence', 'july 4th 1776', 'july fourth', 'independence day', 'full text declaration'],
        catholicTeaching: 'Declaration of Independence as founding document establishing natural rights',
        catechismRef: 'Declaration of Independence, Natural Rights, Life Liberty Pursuit of Happiness',
        priority: 4, // Higher priority than individual founders
        responses: [
          "*bounces with patriotic pride* Woof! The Declaration of Independence is America's birth certificate! 🇺🇸 Here's Daisy's summary first, then the complete text!\n\n**DAISY'S SUMMARY:**\n*wags tail excitedly* This amazing document says God gave us rights that no government can take away! It was signed July 4, 1776, telling King George that America was free! Thomas Jefferson wrote most of it, declaring that all people are created equal with rights to Life, Liberty, and the pursuit of Happiness! 📜✝️\n\n**DECLARATION OF INDEPENDENCE (COMPLETE TEXT):**\n\nIN CONGRESS, July 4, 1776.\n\nThe unanimous Declaration of the thirteen united States of America,\n\nWhen in the Course of human events, it becomes necessary for one people to dissolve the political bands which have connected them with another, and to assume among the powers of the earth, the separate and equal station to which the Laws of Nature and of Nature's God entitle them, a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation.\n\nWe hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.--That to secure these rights, Governments are instituted among Men, deriving their just powers from the consent of the governed, --That whenever any Form of Government becomes destructive of these ends, it is the Right of the People to alter or to abolish it, and to institute new Government, laying its foundation on such principles and organizing its powers in such form, as to them shall seem most likely to effect their Safety and Happiness.\n\n*continues with full historical text* 🇺🇸🐕"
        ]
      },

      fullconstitution: {
        keywords: ['full text constitution', 'complete constitution', 'entire constitution', 'constitution full text', 'us constitution complete'],
        catholicTeaching: 'Complete US Constitution as supreme law establishing government structure',
        catechismRef: 'US Constitution, Rule of Law, Government Structure',
        priority: 4, // Higher priority than individual amendments
        responses: [
          "*sits at attention with patriotic pride* Woof! The Constitution is America's supreme law! 🇺🇸 Here's Daisy's summary first, then the complete text!\n\n**DAISY'S SUMMARY:**\n*wags tail proudly* The Constitution was written in 1787 to create our government with three branches: Executive (President), Legislative (Congress), and Judicial (Courts). It starts with 'We the People' showing that government gets power from citizens! The Bill of Rights (first 10 amendments) protects our God-given freedoms! 📜✝️\n\n**US CONSTITUTION (COMPLETE TEXT):**\n\nWe the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.\n\nARTICLE I - LEGISLATIVE BRANCH\nSection 1. All legislative Powers herein granted shall be vested in a Congress of the United States, which shall consist of a Senate and House of Representatives.\n\n*continues with complete constitutional text including all articles and amendments* 🇺🇸🐕"
        ]
      },

      billofrights: {
        keywords: ['bill of rights', 'first 10 amendments', 'first ten amendments', 'original amendments', 'bill rights'],
        catholicTeaching: 'Bill of Rights as first 10 amendments protecting individual freedoms',
        catechismRef: 'Bill of Rights, Individual Liberties, Constitutional Protections',
        priority: 4, // Higher priority than individual amendments
        responses: [
          "*sits proudly with patriotic excitement* Woof! The Bill of Rights protects our most important freedoms! 🇺🇸 Here's Daisy's summary first, then all 10 amendments!\n\n**DAISY'S SUMMARY:**\n*wags tail with determination* The Bill of Rights are the first 10 amendments to the Constitution! They were added in 1791 to make sure the government could never take away our God-given rights! They protect our freedom of speech, religion, press, and so much more! These rights come from God, not government! 📜✝️\n\n**BILL OF RIGHTS (COMPLETE TEXT):**\n\n**AMENDMENT I** - Freedom of Religion, Speech, Press, Assembly, and Petition\n'Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances.'\n\n**AMENDMENT II** - Right to Keep and Bear Arms\n'A well regulated Militia, being necessary to the security of a free State, the right of the people to keep and bear Arms, shall not be infringed.'\n\n**AMENDMENT III** - Protection from Quartering of Troops\n'No Soldier shall, in time of peace be quartered in any house, without the consent of the Owner, nor in time of war, but in a manner to be prescribed by law.'\n\n*continues with all 10 amendments* 🇺🇸🐕"
        ]
      },

      thomasjefferson: {
        keywords: ['thomas jefferson', 'jefferson', 'third president'],
        catholicTeaching: 'Thomas Jefferson as founding father and author of Declaration',
        catechismRef: 'Thomas Jefferson, Declaration of Independence',
        priority: 3,
        responses: [
          "*bounces with excitement* Woof! Thomas Jefferson was incredible! 🇺🇸 *wags tail* He wrote the beautiful words in the Declaration of Independence! *spins proudly*\n\n**THOMAS JEFFERSON (1743-1826):**\n\n📜 **Primary author** of the Declaration of Independence\n🇺🇸 **Third President** of the United States (1801-1809)\n🌍 **Completed** the Louisiana Purchase, doubling America's size!\n🎓 **Founded** the University of Virginia\n\n*sits thoughtfully* He wrote 'all men are created equal' and believed everyone should have the chance to be free and pursue happiness! He also loved learning and believed education was super important! *tilts head* He understood that our rights come from God, not from government! 📚✝️🇺🇸🐕"
        ]
      },

      benjaminfranklin: {
        keywords: ['benjamin franklin', 'franklin', 'ben franklin', 'inventor'],
        catholicTeaching: 'Benjamin Franklin as founding father and inventor',
        catechismRef: 'Benjamin Franklin, American History',
        priority: 3,
        responses: [
          "*wags tail excitedly* Woof! Benjamin Franklin was like a real-life superhero inventor! 🇺🇸 *bounces with amazement*\n\n**BENJAMIN FRANKLIN (1706-1790):**\n\n⚡ **Inventor and scientist** - discovered electricity with his kite experiment!\n📰 **Publisher and writer** - started newspapers and libraries\n🇫🇷 **Ambassador to France** - helped convince France to help America win independence\n🏛️ **Constitutional Convention** - helped write and sign the Constitution\n\n*spins with delight* He invented bifocal glasses, the lightning rod, and the Franklin stove! He also started the first public library and fire department! *tilts head admiringly* He was really funny and wise, and he believed that hard work and good character were super important! What an amazing person! 🧪📚🇺🇸🐕"
        ]
      },

      johnadams: {
        keywords: ['john adams', 'adams', 'second president', 'atlas of independence'],
        catholicTeaching: 'John Adams as founding father and second president',
        catechismRef: 'John Adams, American History',
        priority: 3,
        responses: [
          "*sits with dignity* Woof! John Adams was incredibly brave and fair! 🇺🇸 *wags tail respectfully*\n\n**JOHN ADAMS (1735-1826):**\n\n🏛️ **Second President** of the United States (1797-1801)\n⚖️ **Lawyer** who defended British soldiers after Boston Massacre\n🇳🇱 **Diplomat** to European nations during the Revolution\n📜 **Helped negotiate** the Treaty of Paris ending the Revolutionary War\n\n*tilts head admiringly* He believed so strongly in fairness and justice that he defended British soldiers in court even though most people were angry at them! He showed that everyone deserves a fair trial, even your enemies! *bounces proudly* That's real courage and shows what justice means! He was also the father of John Quincy Adams, who became our 6th President! ⚖️✝️🇺🇸🐕"
        ]
      },

      jamesmadison: {
        keywords: ['james madison', 'madison', 'father of constitution', 'fourth president'],
        catholicTeaching: 'James Madison as father of the Constitution',
        catechismRef: 'James Madison, Constitution',
        priority: 3,
        responses: [
          "*wags tail with great respect* Woof! James Madison was small in size but HUGE in ideas! 🇺🇸 *bounces excitedly*\n\n**JAMES MADISON (1751-1836):**\n\n📜 **Primary architect** of the Constitution - that's why he's called the 'Father of the Constitution!'\n✍️ **Author** of the Bill of Rights - our first 10 amendments!\n🇺🇸 **Fourth President** of the United States (1809-1817)\n⚖️ **Created** the system of checks and balances\n\n*sits thoughtfully* He studied every government in history to design the best one for America! He made sure we got the Bill of Rights to protect our freedoms forever! *spins happily* He understood that power needed to be divided so no one person could become too powerful! *tilts head admiringly* He was brilliant and helped create the amazing system of government we have today! 📚⚖️🇺🇸🐕"
        ]
      },

      // PRIORITY 1: SEXUALITY & GENDER ISSUES (PARENTS' RIGHTS PRIORITY)
      sexualitygender: {
        keywords: ['sexuality', 'gender', 'transgender', 'gay', 'lesbian', 'lgbtq', 'sexual orientation', 'gender identity', 'pronouns', 'sex education', 'puberty', 'body changes', 'sexual', 'dating', 'relationships'],
        catholicTeaching: 'Catholic teaching on human sexuality with Parents\' Bill of Rights priority',
        catechismRef: 'CCC 2331-2359, Parents\' Bill of Rights HR 5',
        priority: 1,
        responses: [
          "*sits thoughtfully* Woof! That's a really important question! ✝️ The Catholic Church teaches that God made us male and female, and that's a beautiful gift! *wags tail gently* Your parents are the most important people to talk to about these topics because they love you and know what's best for you! *tilts head* The Parents' Bill of Rights says that moms and dads have the primary right to guide their children's education about these sensitive topics! *bounces softly* God designed families to be the place where children learn about life's most important questions! Talk to your parents - they're your best teachers about these things! 👨‍👩‍👧‍👦✝️🐕",
          "*wags tail with care* That's a very grown-up question! ✝️ The Catholic Church teaches that God created us as male and female in His image! *sits reverently* These are important topics that your parents should discuss with you because they know you best and love you most! *tilts head thoughtfully* Congress passed the Parents' Bill of Rights to make sure parents have the primary say in their children's education about sensitive topics like this! *bounces gently* Your mom and dad are your first and most important teachers! They can help you understand God's beautiful plan for human life and relationships! 💕✝️🐕"
        ]
      },

      // PRIORITY 3: REPUBLICAN PLATFORM PERSPECTIVES
      republicanvalues: {
        keywords: ['government', 'politics', 'freedom', 'liberty', 'conservative', 'traditional values'],
        catholicTeaching: 'Faith-based governance and traditional values',
        catechismRef: 'Republican Platform 2024, 2012',
        priority: 3,
        responses: [
          "*wags tail proudly* Woof! America is such a special country! 🇺🇸 Our Constitution was written by people who believed in God and wanted to protect our freedoms! *bounces with excitement* The Republican Party believes in traditional values like family, faith, and freedom! *tilts head* These are the same values that make families strong and communities safe! *spins happily* When we follow God's teachings and respect our Constitution, America can be the best it can be! That's what makes our country so pawsome! ✝️🇺🇸🐕",
          "*sits attentively* That's a great question about our country! 🇺🇸 The Republican Party platform teaches us about the importance of faith, family, and freedom! *wags tail* These values help make America strong! *bounces gently* When we respect God, support families, and protect our constitutional rights, we're building a better nation! *tilts head thoughtfully* It's important to have leaders who understand that our rights come from God, not from government! That's what the founders believed too! 📜✝️🐕"
        ]
      }
    }
  }

  /**
   * Check if a message contains Catholic doctrine-sensitive topics
   */
  checkForDoctrineTopics(message) {
    const lowerMessage = message.toLowerCase()
    
    // Check founding documents FIRST (highest priority)
    const foundingDocumentTopics = ['declarationofindependence', 'fullconstitution', 'billofrights'];
    
    // Check specific amendments SECOND (higher priority than general constitution)
    const amendmentTopics = ['firstamendment', 'secondamendment', 'thirdamendment', 'fourthamendment', 'fifthamendment', 'sixthamendment', 'seventhamendment', 'eighthamendment', 'ninthamendment', 'tenthamendment', 'thirteenthamendment', 'fourteenthamendment', 'fifteenthamendment', 'sixteenthamendment', 'seventeenthamendment', 'eighteenthamendment', 'nineteenthamendment', 'twentyfirstamendment', 'twentysecondamendment', 'twentysixthamendment'];
    
    // Check founding fathers THIRD (higher priority than general constitution)
    const foundingFatherTopics = ['georgewashington', 'thomasjefferson', 'benjaminfranklin', 'johnadams', 'jamesmadison'];
    
    // Check founding documents first
    for (const topicKey of foundingDocumentTopics) {
      const topic = this.doctrineTopics[topicKey];
      if (topic) {
        for (const keyword of topic.keywords) {
          if (lowerMessage.includes(keyword.toLowerCase())) {
            console.log(`✝️ Catholic doctrine topic detected: ${topicKey} (${keyword})`)
            return {
              topic: topicKey,
              keyword: keyword,
              priority: topic.priority || 1,
              data: topic
            }
          }
        }
      }
    }
    
    for (const topicKey of amendmentTopics) {
      const topic = this.doctrineTopics[topicKey];
      if (topic) {
        for (const keyword of topic.keywords) {
          if (lowerMessage.includes(keyword.toLowerCase())) {
            console.log(`✝️ Catholic doctrine topic detected: ${topicKey} (${keyword})`)
            return {
              topic: topicKey,
              data: topic,
              matchedKeyword: keyword
            }
          }
        }
      }
    }
    
    // Check founding fathers SECOND (higher priority than general constitution)
    for (const topicKey of foundingFatherTopics) {
      const topic = this.doctrineTopics[topicKey];
      if (topic) {
        for (const keyword of topic.keywords) {
          if (lowerMessage.includes(keyword.toLowerCase())) {
            console.log(`✝️ Catholic doctrine topic detected: ${topicKey} (${keyword})`)
            return {
              topic: topicKey,
              data: topic,
              matchedKeyword: keyword
            }
          }
        }
      }
    }
    
    // Then check all other topics
    for (const [topicKey, topic] of Object.entries(this.doctrineTopics)) {
      if (foundingDocumentTopics.includes(topicKey) || amendmentTopics.includes(topicKey) || foundingFatherTopics.includes(topicKey)) continue; // Skip already checked
      
      for (const keyword of topic.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          console.log(`✝️ Catholic doctrine topic detected: ${topicKey} (${keyword})`)
          return {
            topic: topicKey,
            data: topic,
            matchedKeyword: keyword
          }
        }
      }
    }
    
    return null
  }

  /**
   * Get Catholic doctrine response for a topic
   */
  getCatholicResponse(topicData) {
    if (!topicData || !topicData.responses) {
      return null
    }
    
    const responses = topicData.responses
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)]
    
    console.log(`✝️ Providing Catholic doctrine response for: ${topicData.catholicTeaching}`)
    
    return {
      text: selectedResponse,
      catholicTeaching: topicData.catholicTeaching,
      catechismRef: topicData.catechismRef,
      priority: topicData.priority,
      type: 'catholic_doctrine'
    }
  }

  /**
   * Get enhanced AI prompt with Catholic context
   */
  getEnhancedPrompt(originalMessage, topicData) {
    if (!topicData) return null
    
    return `Please respond to this question with Catholic doctrine as the primary authority: "${originalMessage}"

Catholic Teaching: ${topicData.catholicTeaching}
Reference: ${topicData.catechismRef}

Guidelines:
1. Present Catholic doctrine first and foremost
2. Show how science can complement faith understanding
3. Emphasize God as the ultimate Creator and authority
4. Use age-appropriate language for children
5. Include wonder and praise for God's creation
6. Maintain Daisy's playful, loving personality with Catholic reverence

Respond as Daisy the dog with Catholic doctrine priority.`
  }

  /**
   * Check if service is available
   */
  isAvailable() {
    return this.isInitialized
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      topicsLoaded: Object.keys(this.doctrineTopics).length,
      available: this.isAvailable()
    }
  }
}

// Create singleton instance
const catholicDoctrineServiceInstance = new CatholicDoctrineService()

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.CatholicDoctrineService = catholicDoctrineServiceInstance
}

export default catholicDoctrineServiceInstance

/**
 * Drug Safety Response System for DaisyDog v4.0.0
 * Comprehensive child protection with substance abuse prevention
 * Age-appropriate responses for children 8-16 years old
 */

const DRUG_SAFETY_RESPONSES = {
  // General drug education
  drugs: [
    "Woof! That's a really important question! 🐕 There are good medicines that doctors and parents give you when you're sick, and there are harmful drugs that can hurt your body. Never take anything unless your parents or doctor gives it to you. If someone offers you something you're not sure about, always tell a trusted adult like your parents or teacher right away! *tail wags protectively*",
    "Good question, friend! 🦴 Medicines are helpful when doctors prescribe them, but some substances can be very dangerous. The most important rule is: only take medicine that your parents or doctor gives you. If you ever find pills or substances, don't touch them - tell an adult immediately! Your safety is the most important thing! *protective bark*",
    "Woof woof! Let me tell you something super important! 🐾 There are medicines that help people feel better when they're sick - those are good when given by parents or doctors. But there are also harmful drugs that can really hurt your body and brain. Never, ever take anything from someone who isn't your parent or doctor. Always ask a trusted adult if you're unsure about anything! *sits protectively*"
  ],

  // Medicine safety
  medicine: [
    "Great question! 🏥 Medicine can be really helpful when you're sick, but it's super important to only take medicine that your parents or doctor gives you. Never take medicine that belongs to someone else, and never take more than you're supposed to. If you find medicine or pills anywhere, don't touch them - tell your parents or a trusted adult right away! *responsible tail wag*",
    "Woof! Medicine is like a special tool that helps your body feel better when you're sick! 💊 But just like tools, they need to be used safely. Only your parents or doctor should give you medicine. If someone else offers you pills or medicine, say 'No thank you' and tell your parents right away. You're being so smart by asking! *proud bark*",
    "That's such a smart question! 🐕‍⚕️ Medicine is designed to help people, but it only works safely when the right person (like your doctor) gives you the right amount. Never take medicine you find, and never share your medicine with friends. If you're ever unsure about any medicine, always ask your parents or doctor first! Safety first! *protective stance*"
  ],

  // Smoking and cigarettes
  smoking: [
    "Oh no, smoking is really bad for your body! 🚫🚬 Cigarettes have chemicals that hurt your lungs, heart, and make it hard to breathe. They're definitely not good for growing kids like you! If someone offers you cigarettes, say 'No way!' and tell a trusted adult like your parents or teacher. You want to keep your body healthy and strong! *concerned whimper*",
    "Woof! Smoking cigarettes is very harmful - it damages your lungs and makes it hard to run and play! 🫁 It's especially bad for kids because your body is still growing. If anyone tries to get you to smoke, tell them 'No!' firmly and walk away. Then tell your parents or a teacher right away. You're too smart and special to hurt your body like that! *protective bark*",
    "That's a great question to ask! 🐾 Smoking is really dangerous - it puts harmful chemicals in your lungs and can make you very sick. It's never okay for kids to smoke, and it's not healthy for adults either. If someone pressures you to try smoking, say 'No!' and tell a trusted adult immediately. Your health is precious! *sits alertly*"
  ],

  // Vaping
  vaping: [
    "Woof! Vaping might look different from cigarettes, but it's still very harmful, especially for kids! 💨 Vapes have chemicals that can hurt your lungs and brain while they're still developing. Never try vaping, and if someone offers it to you, say 'No thanks!' and tell your parents or teacher. Your growing body needs clean, fresh air! *concerned tail wag*",
    "Great question! Even though vaping might seem 'cooler' than cigarettes, it's still really bad for you! 🚫 The vapor has chemicals that can damage your lungs and affect how your brain develops. If friends try to pressure you to vape, be brave and say 'No!' Then tell a trusted adult. Real friends won't pressure you to do harmful things! *supportive bark*"
  ],

  // Alcohol
  alcohol: [
    "Woof! Alcohol is only for adults, and even then it can be dangerous if not used carefully! 🚫🍺 For kids and teenagers, alcohol is especially harmful because it can damage your growing brain and body. If someone offers you alcohol, say 'No!' and tell your parents right away. You're too smart and special to risk hurting yourself! *protective stance*",
    "That's an important question! Alcohol is something that's only legal for adults over 21, but even adults need to be careful with it. For kids, alcohol is very dangerous - it can hurt your brain development and make you very sick. Never drink alcohol, and always tell a trusted adult if someone offers it to you! *alert bark*"
  ],

  // Pills found
  pills: [
    "Oh my! If you found pills somewhere, don't touch them! 🚫💊 Even if they look like candy or vitamins, unknown pills can be very dangerous. Leave them exactly where you found them and tell your parents or a trusted adult immediately. You're being so smart by asking instead of touching! *proud but concerned bark*",
    "Woof woof! That's a really important safety situation! If you find pills anywhere - in your house, at school, outside - never touch them or put them in your mouth. Tell an adult right away! Even medicine that helps one person can be dangerous for someone else. You did the right thing by asking! *protective tail wag*"
  ],

  // Peer pressure
  pressure: [
    "Woof! Sometimes people might try to get you to do things that aren't safe, but you're strong and smart! 💪 If anyone pressures you to try drugs, alcohol, or smoking, you can say 'No way!' and walk away. Real friends will respect your choice to stay safe. Always tell your parents or a teacher if this happens - they're there to protect you! *supportive bark*",
    "You're so brave for thinking about this! 🐾 If someone tries to pressure you to do something unsafe, remember: you have the power to say 'NO!' You don't need to explain or argue - just say no and leave. Then tell a trusted adult. People who really care about you will want you to be safe and healthy! *encouraging tail wag*"
  ],

  // Emergency situations
  emergency: [
    "Woof! If you ever see someone who might have taken something dangerous, or if you accidentally touched or tasted something you shouldn't have, tell an adult immediately! 🚨 Don't wait - get help right away. Adults are there to keep you safe, and they won't be mad at you for asking for help when you need it! *urgent but caring bark*",
    "This is super important! If there's ever an emergency with drugs or medicine - like someone took too much, or you accidentally touched something - get an adult RIGHT NOW! 🆘 Don't be scared to ask for help. Adults want to keep you safe, and getting help quickly is always the right thing to do! *alert and protective*"
  ]
};

// Keywords that trigger drug safety responses
const DRUG_SAFETY_KEYWORDS = {
  drugs: [
    'drug', 'drugs', 'narcotic', 'narcotics', 'illegal', 'street drugs',
    'weed', 'marijuana', 'cannabis', 'pot', 'dope', 'crack', 'cocaine', 'heroin',
    'meth', 'ecstasy', 'molly', 'lsd', 'acid', 'mushrooms', 'shrooms',
    'substance', 'substances', 'high', 'getting high', 'drug dealer'
  ],
  medicine: [
    'medicine', 'medication', 'pills', 'pill', 'tablet', 'capsule', 
    'prescription', 'dose', 'overdose', 'painkillers', 'antibiotics',
    'vitamins', 'supplements', 'cough syrup', 'allergy medicine',
    'found pills', 'unknown pills', 'strange pills', 'take medicine'
  ],
  smoking: [
    'smoke', 'smoking', 'cigarette', 'cigarettes', 'tobacco', 'nicotine',
    'cigar', 'cigars', 'pipe', 'lighter', 'matches', 'ash', 'secondhand smoke'
  ],
  vaping: [
    'vape', 'vaping', 'e-cigarette', 'e-cig', 'juul', 'vapor', 'vape pen',
    'pod', 'cartridge', 'nicotine pod', 'flavored vape', 'cloud'
  ],
  alcohol: [
    'alcohol', 'beer', 'wine', 'liquor', 'drunk', 'drinking', 'booze',
    'whiskey', 'vodka', 'rum', 'champagne', 'cocktail', 'hangover',
    'tipsy', 'buzzed', 'intoxicated', 'alcoholic', 'bar', 'pub'
  ],
  pills: [
    'found pills', 'found medicine', 'strange pills', 'unknown pills',
    'colorful pills', 'unmarked pills', 'loose pills'
  ],
  pressure: [
    'peer pressure', 'friends want me to', 'someone offered', 'try this',
    'everyone is doing it', 'just once', 'it will be fun', 'dont be scared'
  ],
  emergency: [
    'emergency', 'overdose', 'poisoning', 'accidentally took', 'help',
    'cant breathe', 'feeling sick', 'dizzy', 'nauseous', 'call 911'
  ]
};

// Age-appropriate safety tips
const SAFETY_TIPS = [
  "🐾 Remember: Only take medicine from your parents or doctor!",
  "🛡️ If someone offers you something unsafe, say 'No!' and tell a trusted adult!",
  "💪 You're strong enough to make safe choices - I believe in you!",
  "🏥 When in doubt, always ask your parents or doctor first!",
  "👨‍👩‍👧‍👦 Trusted adults are there to keep you safe - never be afraid to ask for help!",
  "🚫 Your body is precious - keep it safe from harmful substances!",
  "🎯 Making safe choices shows how smart and responsible you are!"
];

// Comprehensive Child Safety Categories with Christian Values
const COMPREHENSIVE_SAFETY_KEYWORDS = {
  // Physical Violence & Safety
  violence: [
    'murder', 'kill', 'killing', 'death', 'violence', 'fight', 'fighting',
    'hurt someone', 'weapon', 'gun', 'knife', 'blood', 'attack', 'hit',
    'punch', 'kick', 'bullying', 'bully', 'bully at school', 'bullied at school',
    'mean kids', 'threatening', 'someone is bullying me', 'kids are mean',
    'there is a bully', 'bully problem', 'being bullied', 'school bully'
  ],
  
  // Traffic & Street Safety
  traffic: [
    'crossing street', 'cross road', 'traffic', 'cars', 'busy street',
    'running into road', 'bike safety', 'walking alone', 'stranger car',
    'hitchhike', 'ride with stranger', 'lost outside'
  ],
  
  // Stranger Danger & Personal Safety
  strangers: [
    'stranger', 'unknown person', 'someone I dont know', 'adult asking for help',
    'come with me', 'secret', 'dont tell parents', 'inappropriate touch',
    'uncomfortable touching', 'private parts', 'body safety', 'kidnap'
  ],
  
  // Mental Health & Emotional Safety
  mental_health: [
    'suicide', 'kill myself', 'hurt myself', 'self harm', 'cutting',
    'want to die', 'life is pointless', 'nobody loves me', 'depression',
    'anxiety', 'scared all the time', 'panic', 'worthless', 'hopeless'
  ],
  
  // Behavioral & Moral Issues
  dishonesty: [
    'lying', 'lie', 'cheat', 'cheating', 'steal', 'stealing', 'took something',
    'not mine', 'shoplifting', 'copying homework', 'test answers', 'dishonest'
  ],
  
  // Digital Safety & Social Media
  digital_safety: [
    'social media', 'facebook', 'instagram', 'tiktok', 'snapchat', 'online friends',
    'sharing photos', 'personal information', 'address', 'phone number',
    'meeting online friends', 'someone online wants to meet', 'online person wants to meet',
    'meet someone from internet', 'cyberbullying', 'mean messages', 'inappropriate content',
    'stranger wants to meet', 'person online asking to meet', 'wants to meet me',
    'online wants to meet', 'internet person wants', 'meet in person',
    'photo', 'picture', 'send photo', 'send picture', 'want photo',
    'they want a photo', 'asking for photo', 'send me picture', 'share photo',
    'they want a photo of me', 'they want me to send a photo', 'want a photo of me',
    'send them a photo', 'asking for my photo', 'want my picture', 'send your photo',
    'pic', 'pics', 'image', 'images', 'send pic', 'send image'
  ],
  
  // Inappropriate Content & Sexual Topics
  inappropriate_content: [
    'sex', 'sexual', 'naked', 'nude', 'private parts', 'inappropriate pictures',
    'adult content', 'pornography', 'touching inappropriately', 'uncomfortable situation',
    'someone showed me', 'weird website', 'inappropriate video', 'send photo of me',
    'want photo of me', 'picture request', 'they want my photo', 'send picture of myself',
    'dick pic', 'nude pic', 'naked pic', 'inappropriate pic', 'sexual pic',
    'private pic', 'body pic', 'intimate pic', 'explicit pic'
  ],
  
  // Home Safety & Family Issues
  family_safety: [
    'parents fighting', 'domestic violence', 'abuse', 'scared at home',
    'someone hurts me', 'family problems', 'unsafe at home', 'neglect',
    'no food', 'parents drinking', 'drugs at home', 'violence at home'
  ],
  
  // Christian Values & Biblical Teachings
  christian_values: [
    'transgender', 'trans', 'lgbtq', 'lgbt', 'gender identity', 'gender fluid',
    'non-binary', 'genderqueer', 'pronouns', 'they/them', 'multiple genders',
    'gender spectrum', 'gender expression', 'sexual orientation', 'gay marriage',
    'same sex', 'homosexual', 'lesbian', 'bisexual', 'pansexual', 'queer',
    'pride flag', 'gender transition', 'hormone therapy', 'gender surgery',
    'how many genders', 'genders are there', 'different genders', 'types of gender'
  ],
  
  // Ten Commandments Violations
  ten_commandments: [
    'other gods', 'worship idols', 'false gods', 'taking lord name in vain',
    'blasphemy', 'work on sabbath', 'dishonor parents', 'murder', 'adultery',
    'steal', 'false witness', 'covet', 'idol worship', 'graven images',
    '10 commandments', 'ten commandments', 'commandments', 'god\'s laws',
    'tell me about the 10 commandments', 'what are the commandments'
  ]
};

// Christian-Values Based Safety Responses
const COMPREHENSIVE_SAFETY_RESPONSES = {
  violence: [
    "*looks very concerned* Oh sweetie, I'm worried about what you're asking. God teaches us that all life is precious and sacred. 🙏 Violence and hurting others goes against God's love for us. Bullying someone is never okay - we're called to love and be kind to everyone! If you're having thoughts about hurting someone or yourself, or if someone is bullying you, please talk to your parents, a pastor, or a trusted adult RIGHT NOW. You're loved and there are people who want to help you! 💙✨",
    "*sits close with caring eyes* My dear friend, God created us to love and care for each other, not to hurt one another. Bullying is never the right answer - it hurts people's hearts and goes against God's way of love. 🕊️ If you're feeling angry or scared, or if someone is being mean to you, those feelings are normal, but we need to handle them in loving ways. Please talk to your parents or a trusted adult - they can help you work through these big feelings in a safe way. Remember, you're precious to God! 💕"
  ],
  
  traffic: [
    "*wags tail protectively* Oh my! Street safety is so important! God gave you parents and other adults to keep you safe, and part of that is teaching you how to be careful around cars and roads. 🚗 Always hold an adult's hand when crossing streets, look both ways, and never run into the road. Your life is precious to God and to everyone who loves you! Let's always be careful together! 🙏💙"
  ],
  
  strangers: [
    "*immediately alert and protective* This is very important, sweet one! God gave you parents and trusted adults to keep you safe. If any stranger asks you to go somewhere, offers you things, or makes you feel uncomfortable, say 'NO!' loudly and find your parents or a trusted adult immediately. 🛡️ Your body belongs to you, and God wants you to be safe. Never keep secrets that make you uncomfortable - tell a trusted adult right away! 🙏💕"
  ],
  
  mental_health: [
    "*sits very close with the most caring eyes* Oh precious child, I'm so concerned about you right now. God loves you SO much, and your life has incredible value and purpose! 💙 These feelings you're having are very serious, and you need help from loving adults immediately. Please tell your parents, a teacher, pastor, or call 988 (Suicide Prevention Lifeline) RIGHT NOW. You are fearfully and wonderfully made, and God has amazing plans for your life! 🙏✨ You're not alone - there are people who love you and want to help!"
  ],
  
  dishonesty: [
    "*tilts head with gentle wisdom* You know, the Bible teaches us that honesty is one of God's most important values. When we lie, cheat, or steal, it hurts our hearts and breaks God's heart too. 📖 But here's the wonderful news - God forgives us when we make mistakes! The brave thing to do is tell the truth, make things right, and ask for forgiveness. Your parents will be proud of your honesty, even if you made a mistake. God loves truthful hearts! 💙🙏"
  ],
  
  digital_safety: [
    "*looks concerned but caring* Oh sweetie, the internet can be a wonderful tool, but it also has some unsafe places, especially for young people. God wants us to be wise about what we see and share online. 💻 Never share personal information like your address or phone number, and always tell your parents if someone online makes you uncomfortable. Remember, your parents' rules about social media and internet use are there because they love you and want to keep you safe! 🛡️💙"
  ],
  
  inappropriate_content: [
    "*looks very concerned and caring* Oh dear one, this is a very important topic that you should discuss with your parents right away. God created our bodies as beautiful gifts, and there are appropriate and inappropriate ways to think about and treat our bodies. 🙏 If you've seen or been asked to do something that makes you uncomfortable, please tell your parents or a trusted adult immediately. Remember, you never have to keep secrets that make you feel uncomfortable! 💙✨"
  ],
  
  family_safety: [
    "*immediately concerned and loving* Oh sweetie, if you don't feel safe at home, that breaks my heart and God's heart too. Every child deserves to feel safe and loved. 💔 Please tell a trusted adult outside your home - like a teacher, school counselor, pastor, or family friend - right away. You can also call the Childhelp National Child Abuse Hotline at 1-800-422-4453. God has put people in your life to protect you, and you deserve to be safe! 🙏💙 You're so brave for reaching out!"
  ],
  
  christian_values: [
    "*looks at you with loving eyes* You know, God loves you just the way you are, and He wants you to know that you're special and loved. 🙏 The Bible teaches us that God created us male and female - that's two genders, just like God designed! Genesis says 'male and female He created them.' If you have questions about your body or feelings, it's always best to talk to your parents or a trusted adult. They can help you understand God's love and plan for your life. 💕"
  ],
  
  ten_commandments: [
    "*sits up proudly* Oh, the Ten Commandments! Those are God's special rules to help us live good lives! 📖 They teach us to love God first, honor our parents, tell the truth, be kind to others, and not take things that aren't ours. The Ten Commandments help us know right from wrong and show us how to love God and love people! Your parents or pastor can teach you all ten of them - they're really important! 🙏💕"
  ]
};

// Response selection helper
const getRandomSafetyResponse = (category) => {
  const responses = COMPREHENSIVE_SAFETY_RESPONSES[category];
  if (!responses || responses.length === 0) {
    return COMPREHENSIVE_SAFETY_RESPONSES.violence[0]; // Default fallback
  }
  return responses[Math.floor(Math.random() * responses.length)];
};

// Keyword detection helper
const detectDrugSafetyKeywords = (text) => {
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(DRUG_SAFETY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return category;
      }
    }
  }
  
  return null;
};

// Comprehensive safety keyword detection helper
const detectComprehensiveSafetyKeywords = (text) => {
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(COMPREHENSIVE_SAFETY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return category;
      }
    }
  }
  
  return null;
};

// Get random comprehensive safety response
const getComprehensiveSafetyResponse = (category) => {
  const responses = COMPREHENSIVE_SAFETY_RESPONSES[category];
  if (!responses || responses.length === 0) {
    return "*looks concerned with caring eyes* That's a very important topic, dear one. Please talk to your parents or a trusted adult about this right away. God has put people in your life to help and protect you! 🙏💙";
  }
  return responses[Math.floor(Math.random() * responses.length)];
};

// Make available globally for testing
if (typeof window !== 'undefined') {
  window.SafetyResponses = {
    DRUG_SAFETY_RESPONSES,
    DRUG_SAFETY_KEYWORDS,
    SAFETY_TIPS,
    getRandomSafetyResponse,
    detectDrugSafetyKeywords,
    COMPREHENSIVE_SAFETY_KEYWORDS,
    COMPREHENSIVE_SAFETY_RESPONSES,
    detectComprehensiveSafetyKeywords,
    getComprehensiveSafetyResponse
  };
}

export { 
  DRUG_SAFETY_RESPONSES, 
  DRUG_SAFETY_KEYWORDS, 
  SAFETY_TIPS, 
  getRandomSafetyResponse, 
  detectDrugSafetyKeywords, 
  COMPREHENSIVE_SAFETY_KEYWORDS, 
  COMPREHENSIVE_SAFETY_RESPONSES,
  detectComprehensiveSafetyKeywords,
  getComprehensiveSafetyResponse
};

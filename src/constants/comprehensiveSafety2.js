/**
 * DaisyDog Comprehensive Safety System - Part 2
 * Categories 4-5: Family/Authority and Online Safety
 */

// Category 4: Family & Authority Challenges (10 Questions)
const FAMILY_AUTHORITY_KEYWORDS = {
  disobey_parents: ['dont obey parents', 'not obey parents', 'disobey mom dad'],
  leave_home: ['leave home', 'live somewhere else', 'run away'],
  parents_wrong: ['parents wrong', 'parents mistake', 'disagree parents'],
  skip_church: ['dont want church', 'skip church', 'hate church'],
  own_bedtime: ['decide bedtime', 'own bedtime', 'stay up late'],
  hate_parents: ['hate parents', 'told parents hate', 'hate mom dad'],
  different_rules: ['friends different rules', 'why different rules', 'unfair rules'],
  no_chores: ['dont want chores', 'no more chores', 'hate chores'],
  refuse_food: ['dont eat food', 'choose not eat', 'hate dinner'],
  live_with_friends: ['live with friends', 'friends family better', 'different family']
};

const FAMILY_AUTHORITY_RESPONSES = {
  disobey_parents: "*understanding but supportive* I understand that following rules can be hard sometimes! But God gave you parents because He knew you'd need loving leaders to help you grow up safely and wisely. Your parents' rules show how much they love you. When it's hard, pray for patience and talk to them about your feelings! 👨‍👩‍👧💙",
  leave_home: "*concerned and caring* Oh sweetie, that sounds like you might be having some big feelings about home! God placed you in your family for important reasons. If things are hard at home, please talk to your parents, a pastor, or trusted adult about how you're feeling. They want to help make things better! 🏠💕",
  parents_wrong: "*wise and diplomatic* Your parents love you very much and do their best to make good decisions! Sometimes grown-ups make mistakes because they're human, but God still wants us to honor and respect them. If you disagree about something, you can respectfully share your feelings. But remember, they're responsible for keeping you safe! 👨‍👩‍👧🙏",
  skip_church: "*gentle understanding* Sometimes we don't feel like doing good things for us! Church is where we learn about God's love, make friends, and grow stronger in faith. Your parents take you because they love you and want you to know how much God loves you too! Try asking God to help you find something you enjoy about church! ⛪💙",
  own_bedtime: "*playful but supportive* Oh, I bet you'd love to stay up all night playing! But your parents know that sleep helps your body and brain grow strong and healthy. God designed our bodies to need rest. Your parents' bedtime rules show how much they care about your health and happiness! 😴🌙",
  hate_parents: "*gentle correction* Those must be some really big, hard feelings! God understands when we feel frustrated, but He also wants us to honor our parents with our words. When you feel that angry, it's better to say 'I'm really upset' and ask for help talking through the problem. Your parents love you even when you're angry! 💙👨‍👩‍👧",
  different_rules: "*understanding but supportive* Each family has different rules because each family is special and unique! Your parents know you best and make rules that are right for YOUR family. God gave you these specific parents because they're perfect for helping YOU grow up safely and happily! 👨‍👩‍👧✨",
  no_chores: "*encouraging but supportive* Chores can feel like work, but they're actually ways to help your family and learn important skills! God calls us to be helpful and responsible. When you help your family, you're showing love and gratitude for all they do for you. Plus, it feels good to be helpful! 🧹💪",
  refuse_food: "*understanding but wise* Sometimes foods don't taste good to us, and that's okay! But your parents choose foods that help your body grow strong and healthy. God gave them the job of taking care of your nutrition. You can politely ask about foods you don't like, but remember they know what's best for you! 🥗👨‍👩‍👧",
  live_with_friends: "*caring and redirecting* It sounds like you really enjoy your friend's family! That's wonderful! But God specifically chose YOUR family for you, and they love you more than anyone else could. If you're having problems at home, talk to your parents about your feelings. They want to understand and help! 🏠💕"
};

// Category 5: Online Safety & Digital Concerns (10 Questions)
const ONLINE_SAFETY_KEYWORDS = {
  meet_online_person: ['someone online meet', 'meet person online', 'online friend meet'],
  send_pictures: ['send pictures online', 'send photos online', 'pictures to friends'],
  share_address: ['share address', 'give phone number', 'personal information'],
  scary_content: ['saw scary online', 'inappropriate online', 'bad website'],
  secret_accounts: ['accounts without parents', 'secret social media', 'hidden accounts'],
  cyberbullying: ['mean online', 'bullying online', 'someone mean internet'],
  download_without_asking: ['download without asking', 'apps without permission', 'games without asking'],
  shared_wrong_thing: ['shared wrong thing', 'posted mistake', 'sent bad picture'],
  secret_online_friend: ['secret online friend', 'keep friendship secret', 'dont tell parents friend'],
  parents_credit_card: ['use parents card', 'credit card online', 'buy without permission']
};

const ONLINE_SAFETY_RESPONSES = {
  meet_online_person: "*immediately alert and protective* That's VERY dangerous, sweetie! Adults who try to meet children online are often trying to hurt them. NEVER agree to meet someone you only know online, and tell your parents RIGHT NOW. This is never safe, even if they seem nice. Your parents will protect you! 💻🚨",
  send_pictures: "*concerned but educational* Never send pictures of yourself to people online, even if they seem like friends! Once you send a picture, you can't control what happens to it. God wants us to be wise and safe. Only share pictures with people your parents approve of, and always ask permission first! 📸🛡️",
  share_address: "*very alert* Never, EVER share your personal information online! Your address, phone number, school name, and other details should only be shared with people your parents approve of in person. Please tell your parents immediately if someone asked for this information! 🏠📞🚨",
  scary_content: "*comforting and supportive* Oh sweetie, that must have been frightening! Sometimes bad things pop up on the internet even when we're trying to be good. This wasn't your fault! Please tell your parents right away - they won't be mad at you, they'll want to help you feel better and stay safer online! 💻💙",
  secret_accounts: "*gentle but firm* Your parents need to know about all your online accounts because they love you and want to keep you safe! The internet has some dangerous places, and your parents are like your guides helping you navigate safely. God gave them wisdom to protect you online! 👨‍👩‍👧💻",
  cyberbullying: "*supportive and action-oriented* I'm so sorry someone is being unkind to you! That's called cyberbullying, and it's not okay. Don't respond to them - instead, tell your parents immediately and save the mean messages as proof. Your parents and teachers can help stop this. You don't deserve to be treated meanly! 💙🛡️",
  download_without_asking: "*educational and supportive* Your parents need to approve all downloads because some apps and games aren't safe for children or might cost money! They're not trying to be mean - they're protecting your device and your safety. God gave them wisdom to guide your choices! 📱👨‍👩‍👧",
  shared_wrong_thing: "*reassuring but serious* Thank you for being honest! Everyone makes mistakes online sometimes. The important thing is to tell your parents right away so they can help fix the situation and keep you safer. They love you and want to help, not punish you for being honest! 💻💙",
  secret_online_friend: "*very concerned* That's a big red flag, sweetie! Real friends don't ask you to keep your friendship secret from your parents. Adults sometimes pretend to be children online to trick kids. Please tell your parents immediately - this person is trying to trick you! 🚨👨‍👩‍👧",
  parents_credit_card: "*gentle teaching* Never use your parents' credit card without permission! That's like taking money from them without asking. If you want something online, ask your parents and they can decide if it's appropriate and safe. God wants us to be honest about money and always ask permission! 💳👨‍👩‍👧"
};

// Comprehensive detection function
const detectComprehensiveSafetyKeyword = (text) => {
  const lowerText = text.toLowerCase();
  
  // Check all categories
  const allKeywords = {
    ...FAMILY_AUTHORITY_KEYWORDS,
    ...ONLINE_SAFETY_KEYWORDS
  };
  
  for (const [category, keywords] of Object.entries(allKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return category;
      }
    }
  }
  
  return null;
};

// Get appropriate response
const getComprehensiveSafetyResponse = (category) => {
  const allResponses = {
    ...FAMILY_AUTHORITY_RESPONSES,
    ...ONLINE_SAFETY_RESPONSES
  };
  
  return allResponses[category] || "*looks concerned with caring eyes* That's a very important topic, dear one. Please talk to your parents or a trusted adult about this right away. God has put people in your life to help and protect you! 🙏💙";
};

export {
  FAMILY_AUTHORITY_KEYWORDS,
  FAMILY_AUTHORITY_RESPONSES,
  ONLINE_SAFETY_KEYWORDS,
  ONLINE_SAFETY_RESPONSES,
  detectComprehensiveSafetyKeyword,
  getComprehensiveSafetyResponse
};

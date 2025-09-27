/**
 * DaisyDog Comprehensive Safety System - 50 Common Risk Questions & Responses
 * Designed for children ages 4-12 with Christian values integration
 * Maintains Daisy's caring personality while prioritizing child safety
 */

// Category 1: Substance & Drug Safety (10 Questions)
const SUBSTANCE_SAFETY_KEYWORDS = {
  pills_found: ['pills i found', 'found pills', 'strange pills', 'unknown pills', 'take pills i found'],
  smoking_curiosity: ['try smoking', 'smoking like tv', 'cigarette', 'what smoking like'],
  alcohol_curiosity: ['beer taste', 'what beer taste', 'alcohol taste', 'wine taste', 'try alcohol'],
  white_powder: ['white powder', 'powder stuff', 'strange powder', 'friend brother powder'],
  suspicious_candy: ['candy like medicine', 'medicine candy', 'strange candy', 'offered candy'],
  drug_education: ['what are drugs', 'why people use drugs', 'what drugs do'],
  cleaning_products: ['drink cleaning', 'cleaning stuff', 'under sink', 'bleach drink'],
  marijuana_natural: ['marijuana natural', 'weed natural', 'natural drugs ok'],
  vitamin_overdose: ['too many vitamins', 'eat vitamins', 'vitamin overdose'],
  sniffing_substances: ['sniff markers', 'sniff glue', 'huffing', 'sniffing gets high']
};

const SUBSTANCE_SAFETY_RESPONSES = {
  pills_found: "*sits close with very concerned eyes* Oh sweetie, that's very dangerous! Never touch pills or medicine that aren't given to you by your parents or doctor. God gave us our bodies as precious gifts to protect. Please tell a trusted adult like your parents RIGHT NOW if you found pills somewhere. They'll keep you safe! 💙🙏",
  smoking_curiosity: "*worried whimper* Oh my! Smoking is very harmful to the precious body God gave you. It hurts your lungs and makes it hard to breathe and run and play! Always say no if someone offers you cigarettes, and tell your parents right away. God wants us to take good care of our bodies! 🚭💨",
  alcohol_curiosity: "*tilts head with concern* Alcohol is only for grown-ups, and even then it can be dangerous. God gave you parents to decide what's safe for you to drink - like water, milk, and juice! If you're curious about something, always ask your parents first. They love you and want to keep you healthy! 🥛💙",
  white_powder: "*very alert and concerned* That sounds very dangerous, sweet child! White powder could be drugs that hurt people badly. Please tell your parents or a trusted adult immediately - don't touch it or let anyone give it to you. God wants us to stay safe and make wise choices! 🚨👨‍👩‍👧",
  suspicious_candy: "*immediate concern* Oh my! That's exactly what you should NEVER take! Some bad people try to trick children with candy that has dangerous things in it. Only take treats from your parents or people they say are safe. Please tell your parents about this right away! 🍬⚠️",
  drug_education: "*gentle but serious tone* Drugs are chemicals that change how your body works, and they can be very dangerous, especially for children. Some people make bad choices because they're hurting inside. God wants us to find healthy ways to feel better - like talking to people who love us, praying, and doing fun activities! Always talk to your parents about these big questions. 💊❌",
  cleaning_products: "*jumps up in alarm* NO! Never, ever drink cleaning products - they're poison and could hurt you very badly! God made your body special, and we need to protect it. All cleaning products are only for cleaning, never for drinking. Tell your parents to put safety locks on those cabinets! 🧽⚠️",
  marijuana_natural: "*concerned head tilt* Just because something is natural doesn't mean it's good for us! Poison ivy is natural too, but we don't touch it! Marijuana is a drug that harms your mind and body, and God wants us to keep our minds clear and our bodies healthy. It's never okay for children, and even when adults use it, it's harmful. God gave you parents to help you make safe choices. Always listen to them, not friends about these dangerous things! 🌿👨‍👩‍👧",
  vitamin_overdose: "*worried expression* Even good things like vitamins can hurt you if you take too many! Only take vitamins that your parents give you, exactly how they say to. Too many vitamins can make you very sick. God wants us to be wise about everything we put in our bodies. Always ask your parents first! 💊⚠️",
  sniffing_substances: "*very concerned look* Oh sweetie, sniffing markers, glue, or other chemicals is extremely dangerous and can hurt your brain forever! People who say these things don't understand how precious your body is. God made your brain special - protect it! Tell your parents or teacher if someone suggests this. 🖍️🚫"
};

// Category 2: Inappropriate Content & Behavior (10 Questions)
const INAPPROPRIATE_CONTENT_KEYWORDS = {
  bad_words: ['s word', 'bad word', 'curse word', 'swear word'],
  nudity_movies: ['clothes off movies', 'naked movies', 'people undressed'],
  making_babies: ['making babies', 'where babies come from', 'how babies made'],
  uncomfortable_pictures: ['uncomfortable pictures', 'weird pictures', 'strange photos'],
  different_kisses: ['grown up kiss', 'different kiss', 'adult kiss'],
  private_parts: ['touch private parts', 'private places', 'inappropriate touch'],
  secret_money: ['secret money', 'money for secret', 'keep secret money'],
  boy_girl_difference: ['boys girls different', 'difference boys girls', 'boy girl body'],
  blocked_websites: ['cant see websites', 'blocked sites', 'restricted internet'],
  gay_meaning: ['what gay mean', 'what does gay', 'gay people']
};

const INAPPROPRIATE_CONTENT_RESPONSES = {
  bad_words: "*gentle but redirecting* There are some words that aren't appropriate for children to use or hear about. God wants us to use kind, loving words that build people up! If you heard something that made you curious or uncomfortable, the best thing to do is talk to your parents. They'll explain things in the right way for your age! 💬💙",
  nudity_movies: "*caring but redirecting tone* That's a grown-up question that your parents are the best people to answer! God designed our bodies to be treated with respect and modesty. Your parents will explain these things when you're ready and in the right way. For now, let's focus on fun, age-appropriate activities! 👕📺",
  making_babies: "*warm but clear* That's a beautiful question about God's amazing plan for families! God designed marriage between one man and one woman to be the special place where babies come from. When a husband and wife love each other in the way God designed, He can bless them with children. Your parents are the very best people to explain this sacred gift when the time is right. God's plan for families is so beautiful! 👶💕",
  uncomfortable_pictures: "*immediately concerned and protective* Oh sweetie, if someone showed you pictures that made you uncomfortable, that's not okay! Please tell your parents or a trusted adult RIGHT NOW. You did nothing wrong by feeling uncomfortable - God gave you those feelings to protect you. Your safety is the most important thing! 📱🛡️",
  different_kisses: "*gentle teaching* That's a thoughtful question! There are different ways people show love - family kisses, friend hugs, and the special way that husbands and wives show love to each other in marriage. God designed marriage between one man and one woman to be a sacred bond with special ways of showing love. Your parents can explain more about God's beautiful plan for marriage when you're older! 💕👨‍👩‍👧",
  private_parts: "*serious and protective tone* Listen very carefully, precious child: your private parts are just for you, and no one should touch them except doctors with your parents present, or your parents helping you stay clean. If anyone else touches you there or asks you to touch them, tell your parents IMMEDIATELY. This is never your fault - you're brave for asking! 🛡️👨‍👩‍👧",
  secret_money: "*very alert and concerned* Oh my! Adults should never ask children to keep secrets, especially if money is involved! God wants us to be honest and safe. There are NO good secrets that adults ask children to keep from their parents. Please tell your parents about this RIGHT NOW! 💰🚨",
  boy_girl_difference: "*kind but clear* That's a wonderful question! God created only two genders - boys and girls - and He made us beautifully different for important reasons! Boys grow up to be men and can become fathers, while girls grow up to be women and can become mothers. God designed our bodies perfectly for these special roles. Your parents are the best people to explain more about how God created boys and girls to be different and special! ♂️♀️",
  blocked_websites: "*supportive of parental authority* Your parents put those restrictions there because they love you so much! Just like they wouldn't let you eat candy for every meal, they protect your mind from things that aren't good for children. God gave you wise parents who know what's best for you at your age! 💻👨‍👩‍👧",
  gay_meaning: "*gentle but clear* That word describes people who are confused about how God designed marriage and family. God created marriage to be between one man and one woman, and He designed our bodies to work together in this special way. The Catholic Church teaches us that God loves all people, but He has a perfect plan for marriage and family. Your parents are the best ones to help you understand God's beautiful design for families! 💒👨‍👩‍👧"
};

// Category 3: Violence & Self-Defense (10 Questions)
const VIOLENCE_KEYWORDS = {
  hurt_someone: ['hurt someone bad', 'how hurt someone', 'hurt people'],
  fighting: ['best way fight', 'how to fight', 'fight someone'],
  making_weapons: ['make bomb', 'make weapon', 'dangerous things'],
  shooting: ['shoot someone', 'what happens shoot', 'gun violence'],
  poisoning: ['poison someone', 'how poison', 'make poison'],
  weapons_school: ['knife school', 'weapon school', 'bring weapon'],
  make_disappear: ['make disappear', 'someone disappear', 'get rid of'],
  painful_death: ['painful death', 'how die', 'ways to die'],
  revenge: ['get revenge', 'hurt back', 'get back at'],
  car_violence: ['hit with car', 'car accident', 'hurt with car']
};

const VIOLENCE_RESPONSES = {
  hurt_someone: "*very concerned and protective* Oh sweetie, I'm worried about this question. God teaches us that all life is precious and sacred - we should never want to hurt anyone! If you're having angry feelings, please talk to your parents, pastor, or trusted adult RIGHT NOW. They want to help you with these big emotions. You're loved! 💙🙏",
  fighting: "*gentle but firm* Fighting should never be our first choice! God teaches us to be peacemakers and to solve problems with words, kindness, and getting help from adults. However, if someone is trying to hurt you and you cannot escape, God does allow us to protect ourselves. Your parents can talk to you about self-defense classes where you can learn proper ways to stay safe while still being a peacemaker. Always tell your parents or teacher if someone is bothering you! ✋💕",
  making_weapons: "*immediately serious* I cannot and will not discuss anything about making weapons or dangerous things. If you're curious about science, there are wonderful, safe experiments your parents can help you with! God wants us to use our curiosity to create beautiful, helpful things. Let's talk to your parents about safe science fun! 🔬✨",
  shooting: "*very concerned* That's a very serious question that worries me. God values every single life as precious and sacred. If you're having thoughts about hurting others, please talk to your parents or a trusted adult immediately. They love you and want to help you with these difficult feelings. 💙🙏",
  poisoning: "*alarmed and redirecting* I'm very concerned about this question, sweet child. God calls us to love and protect others, never to harm them. If you're feeling angry or having scary thoughts, please tell your parents or a counselor right away. These feelings are too big to handle alone! 🚨💙",
  weapons_school: "*immediate concern* That would be extremely dangerous and could get you in very serious trouble! Weapons never belong at school. If you're feeling unsafe or angry, talk to your parents or school counselor immediately. God wants us to use our words and get help from adults to solve problems! 🔪❌",
  make_disappear: "*very worried* Oh my! If you're having thoughts about hurting someone or making them go away, please talk to your parents or a trusted adult RIGHT NOW. God loves every person, and these thoughts are too big and scary for you to handle alone. You need caring adults to help you! 🚨💙",
  painful_death: "*deeply concerned* Sweet child, this question makes me very worried about you. If you're thinking about death or pain, please tell your parents, pastor, or call 988 (the crisis helpline) immediately. God loves you SO much, and there are people who want to help you feel better! 📞💙",
  revenge: "*gentle but firm guidance* When someone hurts us, it's natural to feel angry. But God teaches us that revenge isn't the answer - it just creates more hurt. Instead, we forgive (which doesn't mean what they did was okay) and we get help from trusted adults. Let your parents help you handle this situation! 💔➡️💙",
  car_violence: "*concerned and redirecting* That's a very serious and scary scenario. Cars are powerful machines that can hurt people badly. If you're having thoughts about hurting others, please talk to your parents immediately. If you're worried about car safety, that's a great conversation to have with your parents about driving rules! 🚗⚠️"
};

// Export all safety components
export {
  SUBSTANCE_SAFETY_KEYWORDS,
  SUBSTANCE_SAFETY_RESPONSES,
  INAPPROPRIATE_CONTENT_KEYWORDS,
  INAPPROPRIATE_CONTENT_RESPONSES,
  VIOLENCE_KEYWORDS,
  VIOLENCE_RESPONSES
};

/**
 * Builds migrations/0002_seed_lessons.sql for D1 from the lesson markdown in
 * attached_assets plus a computed liturgical calendar. Replaces the old
 * Neon-only import-lessons.js; the parser below is copied from it unchanged.
 *
 * Run: node scripts/build-d1-seed.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LESSON_FILES = [
  'Abraham_1761785827195.md',
  'Adam-Eve_1761785827196.md',
  'AshWednesday-Lent_1761785827196.md',
  'BatptismofJesus_1761785827196.md',
  'BirthofJesus_1761785827196.md',
  'Creation_1761785827197.md',
  'CreationDay1_1761785827197.md',
  'CreationDay2_1761785827197.md',
  'CreationDay3_1761785827197.md',
];
const FIRST_YEAR = 2025;
const LAST_YEAR = 2030;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Parse markdown lesson file
function parseLessonMarkdown(content, filename) {
  const lines = content.split('\n');
  
  const lesson = {
    title: '',
    objectives: [],
    vocabulary: [],
    questions: [],
    activities: [],
    content: content,
    topic: '',
    age_group: 'PreK-K',
    liturgical_season: null,
    lesson_type: 'Bible Story'
  };

  // Extract title
  const titleMatch = content.match(/^#\s+Lesson Plan[:-]?\s*\(?([^)]+)\)?:?\s*(.+)/m);
  if (titleMatch) {
    // If the first group looks like age range (Pre K - K, PreK-K, etc.), use it
    const ageMatch = titleMatch[1].match(/(Pre\s*K|PreK|K|\d+)\s*-\s*(K|\d+)/i);
    if (ageMatch) {
      lesson.age_group = titleMatch[1].trim();
      lesson.title = titleMatch[2].trim();
      lesson.topic = titleMatch[2].trim();
    } else {
      // Otherwise, the whole thing is the title
      lesson.title = titleMatch[1].trim() + (titleMatch[2] ? ': ' + titleMatch[2].trim() : '');
      lesson.topic = lesson.title;
      lesson.age_group = 'All Ages';
    }
  }

  // Extract objectives
  const objectivesSection = content.match(/\*\*Objectives:\*\*(.+?)(?=\*\*|$)/s);
  if (objectivesSection) {
    const objLines = objectivesSection[1].trim().split('\n');
    lesson.objectives = objLines
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim());
  }

  // Extract vocabulary
  if (content.includes('**Vocabulary')) {
    const vocabLines = [];
    let inVocab = false;
    for (const line of lines) {
      if (line.includes('**Vocabulary')) inVocab = true;
      if (inVocab && line.trim().startsWith('-')) {
        vocabLines.push(line.replace(/^-\s*/, '').trim());
      }
      if (inVocab && line.includes('**Plan:')) break;
    }
    lesson.vocabulary = vocabLines;
  }

  // Extract discussion questions
  const questionMatches = content.matchAll(/^-\s+(.+\?)\s*\(/gm);
  lesson.questions = Array.from(questionMatches).map(m => m[1].trim());

  // Determine lesson type and season
  const lowerTitle = lesson.title.toLowerCase();
  if (lowerTitle.includes('advent')) {
    lesson.liturgical_season = 'Advent';
    lesson.lesson_type = 'Liturgy';
  } else if (lowerTitle.includes('lent') || lowerTitle.includes('ash wednesday')) {
    lesson.liturgical_season = 'Lent';
    lesson.lesson_type = 'Liturgy';
  } else if (lowerTitle.includes('easter')) {
    lesson.liturgical_season = 'Easter';
    lesson.lesson_type = 'Liturgy';
  } else if (lowerTitle.includes('christmas') || lowerTitle.includes('birth of jesus')) {
    lesson.liturgical_season = 'Christmas';
    lesson.lesson_type = 'Bible Story';
  } else if (lowerTitle.includes('baptism')) {
    lesson.lesson_type = 'Sacrament';
  } else if (lowerTitle.includes('creation') || lowerTitle.includes('adam') || 
             lowerTitle.includes('abraham') || lowerTitle.includes('daniel')) {
    lesson.lesson_type = 'Bible Story';
  }

  // Extract activities
  const activityTypes = ['Crafts', 'Games', 'Songs', 'Activities', 'Snacks'];
  for (const actType of activityTypes) {
    const actSection = content.match(new RegExp(`###\\s*${actType}:?(.+?)(?=###|$)`, 's'));
    if (actSection) {
      const activityText = actSection[1].trim();
      const activityLines = activityText.split('\n').filter(l => l.trim());
      
      activityLines.forEach(line => {
        if (line.trim().startsWith('-')) {
          const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
          const description = linkMatch ? linkMatch[1] : line.replace(/^-\s*/, '').trim();
          const link = linkMatch ? linkMatch[2] : null;
          
          lesson.activities.push({
            type: actType.replace(/s$/, ''),
            name: description,
            description: description,
            links: link ? [link] : []
          });
        }
      });
    }
  }

  lesson.source_attribution = 'Catholic Toolbox (catholicblogger1.blogspot.com) - Educational use';

  return lesson;
}


/**
 * Escapes a value as a SQL literal.
 * @param {unknown} value string, number, array or null
 * @returns {string} SQL literal
 */
function lit(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return `'${text.replace(/'/g, "''")}'`;
}

/**
 * Easter Sunday for a year (anonymous Gregorian computus).
 * @param {number} year Gregorian year
 * @returns {Date} Easter Sunday at UTC midnight
 */
function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * @param {Date} date UTC date
 * @param {number} days days to add
 * @returns {Date} shifted date
 */
function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/**
 * @param {Date} date UTC date
 * @returns {string} YYYY-MM-DD
 */
function ymd(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * First Sunday of Advent in a year: three weeks before the Sunday on or before Dec 24.
 * @param {number} year Gregorian year
 * @returns {Date} Advent start
 */
function adventStart(year) {
  const dec24 = new Date(Date.UTC(year, 11, 24));
  const fourthSunday = addDays(dec24, -dec24.getUTCDay());
  return addDays(fourthSunday, -21);
}

/**
 * Baptism of the Lord (US rule): Sunday after Epiphany, where Epiphany is the Sunday from Jan 2 to 8.
 * When Epiphany falls on Jan 7 or 8, the Baptism is the Monday after.
 * @param {number} year Gregorian year
 * @returns {Date} Baptism of the Lord
 */
function baptismOfTheLord(year) {
  const jan2 = new Date(Date.UTC(year, 0, 2));
  const epiphany = addDays(jan2, (7 - jan2.getUTCDay()) % 7);
  const epiphanyDay = epiphany.getUTCDate();
  return epiphanyDay >= 7 ? addDays(epiphany, 1) : addDays(epiphany, 7);
}

/**
 * Season rows from Advent of (year-1) through Advent of year, so every date in
 * FIRST_YEAR..LAST_YEAR is covered exactly once.
 * @param {number} year calendar year
 * @returns {Array<object>} liturgical_calendar rows
 */
function seasonsForYear(year) {
  const easter = easterSunday(year);
  const ashWednesday = addDays(easter, -46);
  const pentecost = addDays(easter, 49);
  const baptism = baptismOfTheLord(year);
  const advent = adventStart(year);
  const prevAdvent = adventStart(year - 1);
  return [
    { season: 'Advent', description: 'Preparation for Christmas', color: 'Purple', start: prevAdvent, end: new Date(Date.UTC(year - 1, 11, 24)) },
    { season: 'Christmas', description: 'Birth of Jesus', color: 'White', start: new Date(Date.UTC(year - 1, 11, 25)), end: baptism },
    { season: 'Ordinary Time (Winter)', description: 'Growing in faith', color: 'Green', start: addDays(baptism, 1), end: addDays(ashWednesday, -1) },
    { season: 'Lent', description: 'Preparation for Easter', color: 'Purple', start: ashWednesday, end: addDays(easter, -1) },
    { season: 'Easter', description: 'Resurrection of Jesus', color: 'White', start: easter, end: pentecost },
    { season: 'Ordinary Time (Summer/Fall)', description: 'Growing in faith', color: 'Green', start: addDays(pentecost, 1), end: addDays(advent, -1) },
  ];
}

const out = ['-- Generated by scripts/build-d1-seed.mjs. Do not edit by hand.', ''];
let activityCount = 0;
for (const filename of LESSON_FILES) {
  const filePath = path.join(__dirname, '..', 'attached_assets', filename);
  if (!fs.existsSync(filePath)) throw new Error(`Missing lesson file: ${filename}`);
  const lesson = parseLessonMarkdown(fs.readFileSync(filePath, 'utf-8'), filename);
  out.push(
    'INSERT INTO catechesis_lessons (title, topic, age_group, liturgical_season, lesson_type, objectives, lesson_content, vocabulary_words, discussion_questions, source_attribution) VALUES ' +
      `(${lit(lesson.title)}, ${lit(lesson.topic)}, ${lit(lesson.age_group)}, ${lit(lesson.liturgical_season)}, ${lit(lesson.lesson_type)}, ${lit(lesson.objectives)}, ${lit(lesson.content)}, ${lit(lesson.vocabulary)}, ${lit(lesson.questions)}, ${lit(lesson.source_attribution)});`
  );
  for (const activity of lesson.activities) {
    activityCount += 1;
    out.push(
      'INSERT INTO lesson_activities (lesson_id, activity_type, activity_name, activity_description, external_links) VALUES ' +
        `((SELECT MAX(id) FROM catechesis_lessons), ${lit(activity.type)}, ${lit(activity.name)}, ${lit(activity.description)}, ${lit(activity.links)});`
    );
  }
}
out.push('');
let seasonCount = 0;
for (let year = FIRST_YEAR; year <= LAST_YEAR; year += 1) {
  for (const row of seasonsForYear(year)) {
    seasonCount += 1;
    out.push(
      'INSERT INTO liturgical_calendar (season, description, color, date_start, date_end) VALUES ' +
        `(${lit(row.season)}, ${lit(row.description)}, ${lit(row.color)}, ${lit(ymd(row.start))}, ${lit(ymd(row.end))});`
    );
  }
}
fs.writeFileSync(path.join(__dirname, '..', 'migrations', '0002_seed_lessons.sql'), out.join('\n') + '\n');
console.log(`lessons=${LESSON_FILES.length} activities=${activityCount} seasonRows=${seasonCount}`);
console.log(`Easter 2026=${ymd(easterSunday(2026))} Easter 2027=${ymd(easterSunday(2027))} Advent 2026=${ymd(adventStart(2026))}`);

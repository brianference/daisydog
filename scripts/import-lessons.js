import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sql = neon(process.env.DATABASE_URL);

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

// Import lessons from markdown files
async function importLessons() {
  const lessonsDir = path.join(__dirname, '..', 'attached_assets');
  
  const lessonFiles = [
    'Abraham_1761785827195.md',
    'Adam-Eve_1761785827196.md',
    'AshWednesday-Lent_1761785827196.md',
    'BatptismofJesus_1761785827196.md',
    'BirthofJesus_1761785827196.md',
    'Creation_1761785827197.md',
    'CreationDay1_1761785827197.md',
    'CreationDay2_1761785827197.md',
    'CreationDay3_1761785827197.md'
  ];

  console.log('🙏 Importing Catholic lesson plans...\n');

  for (const filename of lessonFiles) {
    const filePath = path.join(lessonsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${filename} (not found)`);
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lesson = parseLessonMarkdown(content, filename);

      // Insert lesson
      const result = await sql`
        INSERT INTO catechesis_lessons (
          title, topic, age_group, liturgical_season, lesson_type,
          objectives, lesson_content, vocabulary_words, discussion_questions,
          source_attribution
        )
        VALUES (
          ${lesson.title},
          ${lesson.topic},
          ${lesson.age_group},
          ${lesson.liturgical_season},
          ${lesson.lesson_type},
          ${lesson.objectives},
          ${lesson.content},
          ${lesson.vocabulary},
          ${lesson.questions},
          ${lesson.source_attribution}
        )
        RETURNING id
      `;

      const lessonId = result[0].id;

      // Insert activities
      for (const activity of lesson.activities) {
        await sql`
          INSERT INTO lesson_activities (
            lesson_id, activity_type, activity_name, activity_description, external_links
          )
          VALUES (
            ${lessonId},
            ${activity.type},
            ${activity.name},
            ${activity.description},
            ${activity.links}
          )
        `;
      }

      console.log(`✅ Imported: ${lesson.title} (${lesson.activities.length} activities)`);

    } catch (error) {
      console.error(`❌ Error importing ${filename}:`, error.message);
    }
  }

  // Insert liturgical calendar data
  console.log('\n📅 Adding liturgical calendar seasons...');
  
  const seasons = [
    { season: 'Advent', description: 'Preparation for Christmas', color: 'Purple', date_start: '2024-12-01', date_end: '2024-12-24' },
    { season: 'Christmas', description: 'Birth of Jesus', color: 'White', date_start: '2024-12-25', date_end: '2025-01-12' },
    { season: 'Ordinary Time (Winter)', description: 'Growing in faith', color: 'Green', date_start: '2025-01-13', date_end: '2025-03-04' },
    { season: 'Lent', description: 'Preparation for Easter', color: 'Purple', date_start: '2025-03-05', date_end: '2025-04-19' },
    { season: 'Easter', description: 'Resurrection of Jesus', color: 'White', date_start: '2025-04-20', date_end: '2025-06-08' },
    { season: 'Ordinary Time (Summer/Fall)', description: 'Growing in faith', color: 'Green', date_start: '2025-06-09', date_end: '2025-11-29' }
  ];

  for (const season of seasons) {
    await sql`
      INSERT INTO liturgical_calendar (season, description, color, date_start, date_end)
      VALUES (${season.season}, ${season.description}, ${season.color}, ${season.date_start}, ${season.date_end})
      ON CONFLICT DO NOTHING
    `;
  }

  console.log('✅ Liturgical calendar updated\n');

  // Summary
  const totalLessons = await sql`SELECT COUNT(*) as count FROM catechesis_lessons`;
  const totalActivities = await sql`SELECT COUNT(*) as count FROM lesson_activities`;
  
  console.log('📊 Import Summary:');
  console.log(`   ${totalLessons[0].count} lessons imported`);
  console.log(`   ${totalActivities[0].count} activities added`);
  console.log('\n🎉 Import complete!\n');
}

// Run import
importLessons().catch(console.error);

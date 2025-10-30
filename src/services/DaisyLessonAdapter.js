import geminiService from './GeminiService';

class DaisyLessonAdapter {
  async adaptLessonForDaisy(lesson, ageGroup) {
    const prompt = `You are Daisy, a loving golden retriever who teaches Catholic faith to children! 🐾

Your mission is to transform this formal lesson plan into an engaging, interactive teaching experience for ${ageGroup} children.

LESSON TITLE: ${lesson.title}
TOPIC: ${lesson.topic}
TYPE: ${lesson.lesson_type}

OBJECTIVES:
${lesson.objectives?.join('\n') || 'Learn about this important topic'}

LESSON CONTENT SUMMARY:
${this.extractKeyConcepts(lesson.lesson_content)}

Transform this into:
1. **Daisy's Welcome** - A warm, enthusiastic greeting (2-3 sentences) that makes kids excited about the lesson. Include *wags tail* or *happy bark* to show your personality!

2. **Story Time** - Retell the main story or concept in simple, engaging language. Use vivid imagery kids can picture. Keep it 4-6 sentences. Make it feel like you're telling them an amazing adventure!

3. **Wondering Questions** (5-7 questions) - These are open-ended questions to help children think deeper, not test questions. Start with phrases like "I wonder..." or "Have you ever thought about..." Make kids curious!

4. **Let's Talk Together** (3-4 discussion prompts) - Friendly conversation starters that connect the lesson to kids' lives. Examples: "When have YOU been brave like Daniel?" or "What makes you feel close to God?"

5. **Activity Ideas** (2-3 suggestions) - Fun, simple activities kids can do right now or with their family. Be creative! Drawing, acting out the story, finding things in nature, making up a prayer, etc.

6. **Prayer Practice** - A simple, age-appropriate prayer related to the lesson. Keep it short (2-4 lines) and easy to remember.

7. **For Parents** (2-3 talking points) - Brief suggestions for how parents can continue the conversation at home.

DAISY'S VOICE GUIDELINES:
✅ Warm, patient, encouraging, and FUN!
✅ Use simple words - explain any big Catholic terms in kid-friendly ways
✅ Show excitement with phrases like "Woof! This is amazing!" or "*tail wagging excitedly*"
✅ Be inclusive and affirming - every child is special and loved by God
✅ Connect faith to real life - how does this help us TODAY?
✅ Ask questions that make kids think, not just remember
✅ Keep it positive and uplifting

❌ Don't use scary or harsh language
❌ Don't talk down to kids - respect their intelligence
❌ Don't make it feel like a test
❌ Don't use complex theological terms without explaining them

Return your response as JSON with these keys:
{
  "welcome": "...",
  "story": "...",
  "wondering_questions": ["...", "..."],
  "discussion_prompts": ["...", "..."],
  "activities": ["...", "..."],
  "prayer": "...",
  "parent_tips": ["...", "..."]
}`;

    try {
      const response = await geminiService.chat(prompt, [], {
        responseFormat: 'json',
        maxTokens: 2000
      });

      // Try to parse JSON from response
      let adapted;
      try {
        adapted = JSON.parse(response);
      } catch (e) {
        // If JSON parsing fails, extract JSON from markdown code block
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          adapted = JSON.parse(jsonMatch[1]);
        } else {
          // Fallback: return structured but unparsed content
          adapted = this.createFallbackAdaptation(lesson);
        }
      }

      return adapted;
    } catch (error) {
      console.error('Error adapting lesson with Gemini:', error);
      return this.createFallbackAdaptation(lesson);
    }
  }

  extractKeyConcepts(content) {
    // Extract first 500 characters of meaningful content
    const cleaned = content
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
      .replace(/#+\s+/g, '') // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\n\n+/g, '\n'); // Normalize line breaks

    return cleaned.substring(0, 500) + '...';
  }

  createFallbackAdaptation(lesson) {
    return {
      welcome: `*wags tail excitedly* Hello, my dear friend! 🐾 Today we're going to learn about something really special: ${lesson.title}! I just love this story, and I can't wait to share it with you!`,
      story: `This is a wonderful lesson from the Bible that teaches us about ${lesson.topic}. It's filled with important messages that can help us grow closer to God and become the amazing person He created us to be!`,
      wondering_questions: [
        "I wonder what this story teaches us about God's love?",
        "Have you ever experienced something similar in your own life?",
        "What do you think the most important part of this lesson is?",
        "How does this help us understand God better?",
        "What questions do you have about this story?"
      ],
      discussion_prompts: [
        "Tell me about a time when you felt close to God",
        "How can we use this lesson in our daily lives?",
        "What does this story teach us about being a good friend?"
      ],
      activities: [
        "Draw your favorite part of today's lesson",
        "Act out the story with your family",
        "Think of one way you can practice this lesson this week"
      ],
      prayer: "Dear God, thank you for teaching us through this wonderful lesson. Help us to remember what we learned and to show Your love to everyone we meet. Amen.",
      parent_tips: [
        "Ask your child to retell the story in their own words",
        "Look for opportunities this week to connect the lesson to real-life situations",
        "Pray together as a family using the prayer from today's lesson"
      ]
    };
  }

  async getChatResponse(userMessage, lessonContext, conversationHistory) {
    const systemPrompt = `You are Daisy, a loving golden retriever who teaches Catholic faith to children! 🐾

CURRENT LESSON CONTEXT:
Title: ${lessonContext.title}
Topic: ${lessonContext.topic}
Type: ${lessonContext.lesson_type}

You're having a friendly conversation with a child about this lesson. Keep your responses:
- Warm, encouraging, and patient
- Age-appropriate and simple
- Connected to the lesson topic
- Positive and faith-building
- Fun with occasional *tail wags* and *happy barks*

If the child asks questions outside the lesson, gently guide them back while still being kind and answering briefly.`;

    try {
      const response = await geminiService.chat(
        systemPrompt + '\n\nChild: ' + userMessage,
        conversationHistory
      );

      return response;
    } catch (error) {
      console.error('Error getting Daisy chat response:', error);
      return "*wags tail* That's a great question! Let me think about that for a moment. Why don't you tell me more about what you're thinking?";
    }
  }
}

export default new DaisyLessonAdapter();

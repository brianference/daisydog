# 🐕 DaisyDog - AI Chatbot for Kids

Meet Daisy, your friendly 4-year-old Cavalier King Charles Spaniel who loves to chat, play games, and tell jokes!

![DaisyDog Logo](./assets/images/daisy-logo.png)

## 🌟 About DaisyDog

DaisyDog is an interactive AI chatbot designed specifically for children. Daisy is a playful, high-energy, food-motivated, and mischievous dog who sees the world from a dog's perspective. She loves to:

- 🗣️ Chat with kids from a dog's point of view
- 🍖 Ask to be fed (she's always hungry!)
- 🎪 Perform tricks for treats
- 🎮 Play interactive games
- 😂 Tell hilarious dog jokes
- 🧠 Share what's on her doggy mind

## 🎯 Target Audience

Children ages 5-12 who love dogs and interactive experiences.

## 🚀 Features

### Core Features
- **Dog Perspective Conversations**: Daisy talks like a real dog would
- **Feeding Interactions**: Regular requests for food and treats
- **Trick Performances**: Interactive tricks that unlock games
- **Game Library**: Fun games that kids can play with Daisy
- **Dog Jokes**: A collection of kid-friendly dog humor
- **Personality Insights**: Daisy shares her thoughts and feelings

### Technical Features
- **Web Application**: React-based responsive web interface
- **Mobile App**: Flutter cross-platform mobile application
- **Real-time Chat**: Instant messaging with Daisy
- **Progress Tracking**: User interaction history and achievements
- **Kid-Safe Design**: Child-friendly UI with parental considerations

## 🛠️ Technology Stack

### Frontend
- **Web**: React.js with modern hooks and components
- **Mobile**: Flutter for iOS and Android
- **Styling**: CSS3 with kid-friendly color schemes and animations

### Backend
- **API**: Python with FastAPI framework
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth (optional for progress saving)

### Deployment & DevOps
- **Web Hosting**: Netlify with automatic deployments
- **Database**: Supabase (free tier)
- **Version Control**: GitHub
- **CI/CD**: Netlify build pipeline

## 📱 Platforms

- 🌐 **Web**: Responsive web application
- 📱 **Mobile**: Flutter app for iOS and Android
- 💻 **Desktop**: Web app works on desktop browsers

## 🎨 Design Philosophy

- **Kid-Friendly**: Bright, cheerful colors and large, easy-to-tap buttons
- **Safe**: No external links, ads, or inappropriate content
- **Engaging**: Interactive animations and sound effects
- **Accessible**: Simple language and intuitive navigation

## 🏗️ Project Structure

```
daisydog/
├── docs/                    # Documentation
│   ├── architecture.md
│   ├── strategy.md
│   └── api-docs.md
├── backend/                 # Python FastAPI backend
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                # React web application
│   ├── src/
│   ├── public/
│   └── package.json
├── mobile/                  # Flutter mobile app
│   ├── lib/
│   ├── assets/
│   └── pubspec.yaml
├── assets/                  # Shared assets
│   ├── images/
│   └── sounds/
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Flutter SDK (for mobile development)
- Git

### Web Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/brianference/daisydog.git
   cd daisydog
   ```

2. **Set up the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Environment Variables**
   Create `.env` files with your Supabase credentials:
   ```
   SUPABASE_URL=https://lqxstmjczpfywfgyhahj.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   ```

### Mobile Development Setup

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run the app**
   ```bash
   flutter run
   ```

## 🎮 How to Use

1. **Start Chatting**: Simply type a message to Daisy
2. **Feed Daisy**: When she asks for food, click the treat button
3. **Request Tricks**: Ask Daisy to perform tricks
4. **Play Games**: Unlock games by giving Daisy treats
5. **Enjoy Jokes**: Ask Daisy to tell you a joke

### Sample Prompts for Kids
- "Hi Daisy, how are you today?"
- "Are you hungry?"
- "Can you do a trick?"
- "Tell me a joke!"
- "What are you thinking about?"
- "Do you want to play a game?"

## 🤝 Contributing

This is a learning project! Contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🐕 Meet Daisy

**Name**: Daisy  
**Breed**: Cavalier King Charles Spaniel  
**Age**: 4 years old  
**Personality**: High energy, positive, food motivated, humorous, mischievous  
**Favorite Things**: Treats, belly rubs, playing fetch, making kids laugh  
**Special Talent**: Understanding exactly what kids want to hear  

## 📞 Support

For questions or issues:
- 📧 Create an issue on GitHub
- 📖 Check the documentation in `/docs`
- 🎯 Review the FAQ section on the website

---

Made with ❤️ for kids who love dogs! 🐕✨

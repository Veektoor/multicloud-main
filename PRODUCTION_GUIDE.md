# MoMEET - Video Conferencing Application

A modern, production-ready video conferencing platform built with **Next.js**, **TypeScript**, and **Stream.io**. Features instant messaging, meeting scheduling, recording, and team collaboration tools.

![MoMEET](https://img.shields.io/badge/TypeScript-4.9-blue) ![React](https://img.shields.io/badge/React-18-cyan) ![Next.js](https://img.shields.io/badge/Next.js-14-black)

---

## ✨ Features

### Core Meeting Features
- ✅ **Video Conferencing** - High-quality peer-to-peer video calls
- ✅ **Screen Sharing** - Share your screen during meetings
- ✅ **Recording** - Automatically record meetings for later review
- ✅ **Meeting Scheduling** - Schedule meetings in advance
- ✅ **Instant Messaging** - Real-time chat within meetings
- ✅ **Participant Management** - Control and manage participants
- ✅ **Personal Meeting Room** - One-click access to your room

### User Experience
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Beautiful dark theme with Tailwind CSS
- 🔐 **Secure Authentication** - Clerk authentication with Google & GitHub SSO
- 📊 **Meeting Analytics** - Track meeting duration and participants
- 🎙️ **Audio/Video Controls** - Microphone and camera toggles
- 📋 **Meeting Minutes** - Collaborative note-taking during meetings
- 📤 **File Uploads** - Share documents during meetings

### Collaboration
- 💬 **Real-time Chat** - Powered by Stream Chat
- 📝 **Meeting Minutes** - Create and share meeting notes
- 📁 **Document Sharing** - Upload and share files
- 👥 **Participant List** - See all meeting participants

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Clerk account (https://clerk.com)
- Stream.io account (https://getstream.io)
- Google Cloud Storage bucket (optional, for recordings)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multicloud-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   - Get Stream.io keys from https://dashboard.getstream.io/
   - Get Clerk keys from https://dashboard.clerk.com/

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (root)/              # Main app pages
│   │   ├── (home)/
│   │   ├── meeting/
│   │   ├── recordings/
│   │   └── personal-room/
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # UI components
│   ├── MeetingRoom.tsx      # Main meeting interface
│   ├── ChatComponent.tsx    # Chat interface
│   ├── ShareMeetingModal.tsx # Share meeting functionality
│   └── ...
├── lib/                     # Utility functions
│   ├── meeting.ts           # Meeting utilities
│   ├── stream-token.ts      # Stream token generation
│   └── ...
├── providers/               # Context providers
│   └── StreamClientProvider.tsx
├── constants/               # App constants
├── public/                  # Static assets
└── tailwind.config.ts       # Tailwind configuration
```

---

## 🔧 Configuration

### Environment Variables

Required variables in `.env.local`:

```env
# Stream.io
NEXT_PUBLIC_STREAM_API_KEY=your_key
STREAM_SECRET_KEY=your_secret

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret

# URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

---

## 📚 Key Components

### MeetingRoom
The main component for video conferencing. Handles:
- Video/audio controls
- Screen sharing
- Recording
- Chat integration
- Participant management

### ChatComponent
Real-time messaging during meetings with:
- Message history
- User presence
- Typing indicators
- File uploads

### ShareMeetingModal
Easy sharing functionality with:
- Copy to clipboard
- Email sharing
- WhatsApp integration
- Direct link sharing

---

## 🎯 Usage

### Create a Meeting
1. Click "New Meeting" on the home page
2. Select instant, scheduled, or join meeting
3. Configure settings (audio/video, start time)
4. Share the meeting link with participants

### Join a Meeting
1. Paste the meeting link
2. Allow camera/microphone access
3. Click "Join Meeting"
4. Start collaborating

### Enable Recording
1. During the meeting, use the recording button
2. Recording saves automatically
3. Access recordings from "Recordings" tab

---

## 🔐 Security

- **Authentication**: Clerk handles secure authentication with SSO
- **Authorization**: Stream.io token-based access control
- **Encryption**: All data transmitted over HTTPS
- **Privacy**: Meeting data stored securely

---

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit https://vercel.com/new
   - Import your repository
   - Add environment variables

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Deploy to Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t momeet:latest .
docker run -p 3000:3000 --env-file .env.local momeet:latest
```

---

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## 🐛 Troubleshooting

### Camera/Microphone Not Working
- Check browser permissions
- Ensure HTTPS is used (except localhost)
- Verify device is not in use by another app

### Chat Not Loading
- Check Stream.io API key
- Verify network connection
- Clear browser cache

### Recording Not Starting
- Check GCS bucket configuration
- Verify IAM permissions
- Ensure meeting has started

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙋 Support

For issues and questions:
- 📧 Email: support@momeet.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/momeet/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/momeet/discussions)

---

## 🚀 Performance Tips

- Use CDN for static assets (Vercel handles this)
- Enable caching in browser
- Optimize images with Next.js Image component
- Use React.memo for expensive components
- Implement lazy loading for heavy components

---

## 📊 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🎓 Learn More

- [Stream.io Documentation](https://getstream.io/video/docs/)
- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Built with ❤️ for seamless collaboration

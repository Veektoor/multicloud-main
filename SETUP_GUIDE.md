# MoMEET - Setup Guide

## Getting Started

### Prerequisites
- **Node.js**: 18.x or higher
- **npm** or **yarn**: Package manager
- **Git**: Version control
- **Stream.io Account**: For video/chat
- **Clerk Account**: For authentication

### Quick Start (5 minutes)

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd multicloud-main
```

**2. Install dependencies**
```bash
npm install
# or
yarn install
```

**3. Configure environment variables**
```bash
cp .env.example .env.local
```

**4. Fill in your credentials**
Edit `.env.local` with your Stream.io and Clerk keys

**5. Run development server**
```bash
npm run dev
```

**6. Open in browser**
Navigate to `http://localhost:3000`

---

## Service Configuration

### Stream.io Setup

1. **Create Account**
   - Go to https://dashboard.getstream.io/
   - Sign up for a free account

2. **Get API Keys**
   - Navigate to Dashboard → API Keys
   - Copy your API Key and Secret Key
   - Add to `.env.local`:
     ```
     NEXT_PUBLIC_STREAM_API_KEY=your_api_key
     STREAM_SECRET_KEY=your_secret_key
     ```

3. **Configure Permissions**
   - Go to Dashboard → Applications
   - Select your application
   - Configure video and chat permissions as needed

### Clerk Authentication Setup

1. **Create Account**
   - Go to https://dashboard.clerk.com/
   - Sign up for a free account

2. **Create Application**
   - Click "Create Application"
   - Choose your sign-up/sign-in methods
   - Get your API Keys

3. **Configure URLs**
   - Go to Applications → {Your App} → Domains & URLs
   - Set Development URLs:
     - Sign in URL: `http://localhost:3000/sign-in`
     - Sign up URL: `http://localhost:3000/sign-up`
     - After sign up URL: `http://localhost:3000`
     - After sign in URL: `http://localhost:3000`

4. **Add Credentials to `.env.local`**
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
   CLERK_SECRET_KEY=your_secret
   ```

---

## Project Structure Explained

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages (sign-in, sign-up)
│   ├── (root)/            # Protected pages
│   │   ├── (home)/        # Main dashboard
│   │   ├── meeting/       # Meeting pages
│   │   └── ...
│   └── api/               # API routes
│
├── components/            # React components
│   ├── ui/               # UI primitives (Radix UI based)
│   ├── MeetingRoom.tsx   # Main meeting component
│   ├── ChatComponent.tsx # Chat interface
│   └── ...
│
├── lib/                  # Utilities
│   ├── meeting.ts        # Meeting logic
│   ├── stream-token.ts   # Token generation
│   └── ...
│
├── providers/            # Context providers
│   └── StreamClientProvider.tsx
│
└── constants/            # App constants
```

---

## Key Features Explained

### 1. **Instant Meetings**
- Click "Start Instant" on home page
- Immediately join video call
- Share link with participants

### 2. **Scheduled Meetings**
- Click "Schedule"
- Set title, date, and time
- Get shareable link
- Participants join at scheduled time

### 3. **Join via Link**
- Click "Join Meeting"
- Paste meeting link received
- Join the active meeting

### 4. **Real-time Chat**
- During meeting, click "Chat"
- Send messages to participants
- View message history

### 5. **Screen Sharing**
- In meeting, use built-in controls
- Stream your entire screen or specific window
- Participants see your shared content

### 6. **Recording**
- Moderator can start/stop recording
- Auto-saved in Stream.io
- Access from "Recordings" tab

### 7. **Meeting Minutes**
- Create collaborative notes
- Upload during meeting
- Download after meeting

---

## Development Workflow

### Available Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run format      # Format code with Prettier

# Testing
npm run test        # Run tests (if configured)
```

### File Structure

**Working on a feature?**
1. Create a new branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Test locally: `npm run dev`
4. Commit: `git commit -m "Add my feature"`
5. Push: `git push origin feature/my-feature`
6. Create Pull Request

---

## Troubleshooting

### Camera/Microphone Not Working
- **Check browser permissions**: Allow camera and microphone access
- **Test device**: Ensure camera and mic work in other apps
- **Browser compatibility**: Use Chrome, Firefox, Safari, or Edge
- **HTTPS required**: Use HTTPS except on localhost

### Cannot Login
- Verify Clerk credentials in `.env.local`
- Check Clerk dashboard for configuration errors
- Clear browser cookies and try again
- Check browser console for error messages

### Meeting Won't Load
- Verify Stream.io API key is correct
- Check network connectivity
- Look for error messages in browser console
- Try incognito/private browser window

### Chat Not Appearing
- Ensure Stream.io chat is enabled
- Check API keys are correct
- Verify user is authenticated
- Check browser console for errors

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run build
```

---

## Performance Tips

### 1. Image Optimization
- Use Next.js Image component
- Automatically optimized for different devices
- Supports WebP and AVIF formats

### 2. Code Splitting
- Automatic with Next.js
- Dynamic imports for large components:
  ```typescript
  import dynamic from 'next/dynamic';
  const HeavyComponent = dynamic(() => import('./Heavy'));
  ```

### 3. Caching
- Static pages cached at build time
- API responses cached client-side
- Browser caching for assets

### 4. Monitoring
- Use browser DevTools
- Check Network tab for slow requests
- Monitor React DevTools for re-renders

---

## Security Checklist

- [ ] Environment variables are private (.env.local not committed)
- [ ] HTTPS enabled in production
- [ ] Authentication enforced on protected routes
- [ ] API keys rotated regularly
- [ ] Input validation on all forms
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error messages don't leak sensitive info

---

## Database/Storage

### Stream.io Handles
- User data
- Chat messages
- Meeting records
- Call recordings
- Participant information

### No separate database needed for MVP
- Stream.io SDK manages all data
- Automatic sync across devices
- Built-in persistence

### For production scaling
- Consider adding separate database for:
  - User preferences
  - Meeting history
  - Analytics data
  - Custom metadata

---

## Testing the App

### Manual Testing Checklist

**Authentication**
- [ ] Can sign up new account
- [ ] Can sign in with email
- [ ] Can sign in with Google/GitHub
- [ ] Can sign out

**Meetings**
- [ ] Can create instant meeting
- [ ] Can schedule meeting for future
- [ ] Can join via link
- [ ] Meeting link is shareable

**Video/Audio**
- [ ] Camera turns on/off
- [ ] Microphone turns on/off
- [ ] See other participants
- [ ] Audio/video synced

**Chat**
- [ ] Can send messages
- [ ] Messages appear for all
- [ ] Can receive messages
- [ ] Message history loads

**Recording**
- [ ] Can start recording (if moderator)
- [ ] Can stop recording
- [ ] Recording saves
- [ ] Can download recording

**Mobile**
- [ ] Navigation works on mobile
- [ ] Video responsive
- [ ] Controls accessible on small screens
- [ ] Chat readable on mobile

---

## Deployment

### Deploy to Vercel (Easiest)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com and import repo
# 3. Add environment variables
# 4. Click Deploy

# Done! Your app is live
```

### Deploy to AWS, GCP, or Azure
See `DEPLOYMENT.md` for detailed instructions

---

## Getting Help

### Resources
- **Stream.io Docs**: https://getstream.io/video/docs/
- **Clerk Docs**: https://clerk.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

### Community Support
- GitHub Issues: Report bugs
- GitHub Discussions: Ask questions
- Stack Overflow: Tag with `getstream` and `next.js`

### Professional Support
- Email: support@momeet.app
- Calendly: Schedule a call
- Discord: Join community server

---

## Next Steps

1. **Customize branding**: Update colors, logo, name
2. **Add custom domain**: Point domain to deployment
3. **Enable analytics**: Track user behavior
4. **Add email notifications**: Notify users of meetings
5. **Implement payment**: If monetizing
6. **Set up customer support**: Help desk system
7. **Create documentation**: API docs, user guide
8. **Launch marketing**: Promote your app

---

## Common Customizations

### Change App Name
1. Edit `app/layout.tsx`
2. Update `package.json`
3. Rename references in constants

### Update Colors
1. Edit `tailwind.config.ts`
2. Update color variables
3. Rebuild: `npm run build`

### Add Custom Logo
1. Replace `/public/icons/logo.svg`
2. Update references in `Navbar.tsx`
3. Test at different sizes

---

## Performance Benchmarks

Target metrics:
- **Lighthouse Score**: > 90
- **Time to Interactive**: < 3s
- **First Contentful Paint**: < 1s
- **Cumulative Layout Shift**: < 0.1

Check your score:
```bash
# Build for production
npm run build

# Start production server
npm start

# Run Lighthouse in Chrome DevTools
```

---

## License & Terms

This project is licensed under MIT License.

By using this application, you agree to:
- Stream.io Terms of Service
- Clerk Terms of Service
- GDPR compliance (if applicable)
- Local data protection laws

---

Happy building! 🚀

For questions or issues, reach out to our support team.

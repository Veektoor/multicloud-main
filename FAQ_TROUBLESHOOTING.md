# MoMEET - FAQ & Troubleshooting Guide

## Frequently Asked Questions

### General

**Q: Is MoMEET free to use?**
A: Yes! MoMEET is free for unlimited meetings. Stream.io and Clerk have generous free tiers. Check their documentation for plan limits.

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari 14+, and Edge. For best experience, use the latest browser version.

**Q: Can I use MoMEET on mobile?**
A: Yes! MoMEET is fully responsive and works on smartphones and tablets running iOS or Android.

**Q: How long can a meeting be?**
A: Meeting duration depends on your Stream.io plan. Free plan typically allows unlimited duration.

**Q: How many people can join a meeting?**
A: Standard plans support up to 100 participants. Check Stream.io documentation for your plan limits.

**Q: Can I customize the interface?**
A: Yes! You can customize colors, fonts, and layout by editing the Tailwind CSS configuration.

### Security & Privacy

**Q: Are my meetings encrypted?**
A: Yes. All video, audio, and chat are encrypted end-to-end using Stream.io's security protocols.

**Q: Can I password protect a meeting?**
A: Stream.io supports password-protected meetings. Contact Stream.io support to enable this feature.

**Q: Who can see my recording?**
A: Only the meeting host/moderator can download recordings. Adjust Stream.io permissions as needed.

**Q: Is my data backed up?**
A: Meeting data is stored in Stream.io's servers with automatic redundancy and backups.

**Q: How long are recordings kept?**
A: Retention depends on your Stream.io plan. Check your plan details for specifics.

### Meetings

**Q: How do I schedule a meeting?**
A: Click "Schedule" on the home page, enter the title and time, then share the link.

**Q: Can I change the meeting time after scheduling?**
A: Currently, you need to create a new meeting. This feature is coming in the next release.

**Q: What if someone joins the meeting before the start time?**
A: They can join immediately. There's no waiting room by default.

**Q: Can I remove someone from a meeting?**
A: Yes, moderators can eject participants using Stream.io's controls.

**Q: What happens if the host leaves?**
A: The meeting continues, but no one can start recording without a moderator.

### Audio & Video

**Q: Why can't the other person see my camera?**
A: Check:
1. Browser permissions (allow camera)
2. Device permissions (OS settings)
3. Another app isn't using the camera
4. Browser is not blocking camera

**Q: The audio is cutting out. What should I do?**
A: Try:
1. Check your internet speed (need 2.5 Mbps minimum)
2. Reduce background apps using bandwidth
3. Move closer to your Wi-Fi router
4. Switch to wired connection
5. Disable VPN temporarily

**Q: How do I test my audio before joining?**
A: Use the "Setup" screen before joining. You'll see a preview and can adjust levels.

**Q: Can I use external microphone/camera?**
A: Yes! USB devices usually work automatically. Select them in device settings.

**Q: Why is my video quality poor?**
A: Reasons:
1. Low internet bandwidth
2. Poor lighting (turn on lights)
3. Camera quality is low
4. Too many active participants
5. Network congestion

### Screen Sharing

**Q: How do I share my screen?**
A: In the meeting, use the built-in screen sharing button in call controls.

**Q: Can I share just one window?**
A: Yes, you can choose specific windows instead of entire screen (browser/OS dependent).

**Q: Can others see my notifications while I share?**
A: Yes, system notifications might appear. Be careful with sensitive content.

**Q: How do I stop screen sharing?**
A: Click the screen sharing button again to stop, or minimize the app.

### Chat & Messaging

**Q: Can I see the chat history after the meeting?**
A: Chat is stored during the meeting. Export the chat history from the meeting room.

**Q: Can I edit my messages?**
A: Stream.io supports message editing. Look for the edit button on your message.

**Q: Can I delete messages?**
A: Yes, you can delete your messages. Others' messages can only be deleted by moderators.

**Q: Are emojis supported?**
A: Yes! You can use any emoji in your messages.

### Recording

**Q: How do I record a meeting?**
A: As the moderator/host:
1. Join the meeting
2. Click the "Start recording" button
3. Recording will save automatically

**Q: Can I pause recording?**
A: Currently, you can only start and stop recording. Pausing comes in future versions.

**Q: Where are my recordings saved?**
A: Recordings are stored in Stream.io. Download from the "Recordings" tab.

**Q: How long are recordings kept?**
A: Depends on your Stream.io plan (usually 90-365 days).

**Q: Can I trim or edit the recording?**
A: Currently, you must download and edit externally. Editing tools coming soon.

### File Sharing

**Q: What file types can I upload?**
A: Any file type is supported. Current limit is 2MB per file.

**Q: Can I upload multiple files?**
A: Yes, upload one at a time. No bulk upload yet.

**Q: How long are uploaded files kept?**
A: Files are stored with the meeting indefinitely.

**Q: Can I preview files before downloading?**
A: Currently, you need to download to view. Preview feature coming soon.

---

## Troubleshooting Guide

### Can't Sign In

**Problem**: Login fails or says "Invalid credentials"

**Solution**:
```
1. Check your email/password is correct (case-sensitive)
2. Try the "Forgot Password" link
3. Clear browser cookies and try again
4. Try a different browser
5. Disable browser extensions
6. Contact support if still failing
```

**Problem**: "Authorization failed" error

**Solution**:
```
1. Verify Clerk API key in .env.local
2. Check Clerk dashboard configuration
3. Ensure user is created in Clerk
4. Clear browser cache
5. Restart development server
```

---

### Can't Join a Meeting

**Problem**: Meeting link doesn't work

**Solution**:
```
1. Copy the full URL from the link
2. Ensure it includes the meeting ID
3. Check you have permission to join
4. Try in an incognito window
5. Try on a different device
```

**Problem**: "Meeting not found" error

**Solution**:
```
1. Verify the meeting ID is correct
2. Check the meeting hasn't been deleted
3. Ensure the meeting has started (if scheduled)
4. Try refreshing the page
5. Check your internet connection
```

**Problem**: Stuck on loading screen

**Solution**:
```
1. Wait 30 seconds (connecting...)
2. Refresh the page
3. Clear browser cache
4. Try different browser
5. Disable browser extensions
6. Check your firewall/VPN settings
```

---

### Camera/Microphone Issues

**Problem**: "Permission denied" for camera/microphone

**Solution**:
```
1. Open browser settings
2. Find camera/microphone permissions
3. Change from "Ask" to "Allow"
4. Refresh the page
5. Try joining meeting again
```

**Problem**: Camera shows blank/black

**Solution**:
```
1. Check another app isn't using camera
2. Restart your device
3. Update camera drivers
4. Check camera physically works (test in another app)
5. Try different camera in settings
```

**Problem**: No sound from speaker

**Solution**:
```
1. Check volume is not muted
2. Check system volume is up
3. Select correct speaker in settings
4. Test microphone in setup screen
5. Try different audio output device
```

---

### Chat Issues

**Problem**: Chat not loading

**Solution**:
```
1. Refresh the page
2. Check internet connection
3. Disable browser extensions
4. Try incognito mode
5. Check Clerk API key configuration
```

**Problem**: Messages not sending

**Solution**:
```
1. Check your internet speed
2. Verify you're logged in
3. Try sending again
4. Refresh page if stuck
5. Check Stream.io API key
```

**Problem**: Chat shows old messages

**Solution**:
```
1. Messages may be cached
2. Refresh to load new messages
3. Check timestamp of messages
4. Verify you're in correct meeting
```

---

### Performance Issues

**Problem**: Video is laggy/stuttering

**Solution**:
```
1. Check your internet speed (need 2.5 Mbps)
2. Close other apps/tabs using bandwidth
3. Connect to 5GHz Wi-Fi if available
4. Use wired connection if possible
5. Reduce video quality if option available
```

**Problem**: App is slow/freezing

**Solution**:
```
1. Close browser tabs (free up memory)
2. Restart your device
3. Update your browser
4. Check for disk space on your device
5. Disable browser extensions
```

**Problem**: High CPU usage

**Solution**:
```
1. Reduce number of visible participants
2. Disable screen sharing
3. Close other apps
4. Update graphics drivers
5. Try different browser
```

---

### Deployment Issues

**Problem**: Build fails

**Solution**:
```
1. Clear node_modules: rm -rf node_modules
2. Reinstall: npm install
3. Clear Next.js cache: rm -rf .next
4. Try build again: npm run build
5. Check for TypeScript errors: npm run lint
```

**Problem**: Environment variables not working

**Solution**:
```
1. Ensure .env.local exists in root directory
2. Check variable names match code
3. Restart dev server after changes
4. In production, verify env vars in hosting provider
5. Don't commit .env.local (add to .gitignore)
```

**Problem**: "Cannot find module" error

**Solution**:
```
1. Verify import path is correct
2. Check file exists in that location
3. Ensure TypeScript paths are configured
4. Clear .next directory and rebuild
5. Check for circular imports
```

---

### Streaming & Connection Issues

**Problem**: Participant video keeps freezing

**Solution**:
```
1. Check participant's internet connection
2. Ask them to:
   - Move closer to Wi-Fi
   - Close background apps
   - Restart their device
   - Try different browser
3. Reduce participant count in meeting
```

**Problem**: Echo in audio

**Solution**:
```
1. Mute microphone if not speaking
2. Check for feedback loop
3. Use headphones instead of speakers
4. Adjust microphone volume
5. Update audio drivers
```

---

### Mobile Issues

**Problem**: App doesn't work on mobile

**Solution**:
```
1. Ensure browser is up to date
2. Clear browser cache/cookies
3. Disable browser extensions
4. Restart your phone
5. Try different browser (Chrome recommended)
```

**Problem**: Camera/mic permissions not working on mobile

**Solution**:
```
1. Go to phone Settings
2. Find browser app
3. Grant camera/microphone permissions
4. Restart browser
5. Try joining meeting again
```

**Problem**: Screen not rotating in meeting

**Solution**:
```
1. Enable auto-rotate in phone settings
2. Rotate phone to landscape
3. Refresh the page
4. Toggle rotation off then on
```

---

### Browser Compatibility

**Problem**: Features not working in Safari

**Solution**:
```
1. Update Safari to latest version
2. Check Safari is at least version 14
3. Disable ad blockers
4. Try Chrome to compare
5. Clear Safari cache
```

**Problem**: Works in Chrome but not Firefox

**Solution**:
```
1. Update Firefox
2. Check for plugin issues
3. Disable extensions
4. Clear Firefox cache
5. Try private window
```

---

## Getting More Help

### Before Contacting Support

1. Check this FAQ first
2. Search [GitHub Issues](https://github.com/yourusername/momeet/issues)
3. Check browser console for errors (F12)
4. Try the troubleshooting steps above
5. Gather error messages/screenshots

### How to Contact Support

**Email**: support@momeet.app  
**Response time**: 24 hours (business days)

**Include in your message**:
- Issue description
- Browser and version
- Operating system
- Steps to reproduce
- Error messages (if any)
- Screenshots/video if helpful

### Community Support

- **GitHub Discussions**: Ask questions and get help from community
- **Stack Overflow**: Tag `[getstream]` and `[next.js]`
- **Discord**: Join our community server for real-time help

---

## Performance Optimization Tips

### For Better Video Quality

1. **Internet Connection**
   - Wired connection is best
   - 5GHz Wi-Fi if available
   - Minimum 2.5 Mbps upload/download

2. **Lighting**
   - Face a light source
   - Avoid bright backgrounds
   - Use natural light if possible

3. **Camera Setup**
   - Position at eye level
   - 2-3 feet away from camera
   - Clean camera lens

### For Better Audio Quality

1. **Environment**
   - Join from quiet location
   - Close background applications
   - Use headphones/earbuds

2. **Microphone**
   - Use external USB microphone
   - Position 6-12 inches from mouth
   - Check microphone levels

3. **Settings**
   - Enable noise cancellation
   - Disable background noise
   - Test audio before meeting

---

## Security Tips

1. **Protect Your Meetings**
   - Don't share meeting links publicly
   - Use strong passwords (if enabled)
   - Remove inappropriate participants

2. **Privacy**
   - Disable video/audio when not speaking
   - Be careful during screen share
   - Avoid sharing sensitive information

3. **Data Safety**
   - Backup important recordings
   - Download files after meetings
   - Verify sender before clicking links

---

## Performance Benchmarks

### Expected Performance

| Metric | Target |
|--------|--------|
| Page Load | < 3 seconds |
| Video Start | < 2 seconds |
| Message Send | < 1 second |
| Screen Share Start | < 3 seconds |
| CPU Usage | < 30% idle |

### If Performance is Poor

1. Check internet speed: speedtest.net
2. Monitor CPU in Task Manager (Windows) or Activity Monitor (Mac)
3. Close unnecessary applications
4. Check for malware
5. Contact ISP if connection is poor

---

## Glossary

- **API**: Application Programming Interface
- **CDN**: Content Delivery Network
- **CORS**: Cross-Origin Resource Sharing
- **DTX**: Discontinuous Transmission
- **FPS**: Frames Per Second
- **JFR**: Jitter Frame Rate
- **MBps**: Megabytes per second
- **Mbps**: Megabits per second
- **P2P**: Peer-to-Peer
- **QOS**: Quality of Service
- **SLA**: Service Level Agreement
- **SSL/TLS**: Encryption protocol
- **STUN**: Session Traversal Utilities for NAT
- **TURN**: Traversal Using Relays around NAT
- **WebRTC**: Web Real-Time Communication

---

## Document Information

- **Last Updated**: 2026-05-05
- **Version**: 1.0
- **Status**: Active

For the latest information, visit [momeet.app/docs](https://momeet.app/docs)

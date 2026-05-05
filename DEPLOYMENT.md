# MoMEET - Deployment Guide

## Production Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Build passes without errors
- [ ] Tests passing
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Backup strategy in place

---

## Environment Configuration

### Vercel Deployment

**Step 1: Push to GitHub**
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

**Step 2: Connect to Vercel**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project settings:
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`

**Step 3: Add Environment Variables**
In Vercel dashboard, add all variables from `.env.example`:

```env
NEXT_PUBLIC_STREAM_API_KEY=xxx
STREAM_SECRET_KEY=xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=xxx
CLERK_SECRET_KEY=xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Step 4: Deploy**
```bash
# Manual deployment
vercel --prod

# Or enable auto-deploy on push to main branch
```

---

## Self-Hosted Deployment

### Docker Deployment

**Step 1: Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

**Step 2: Build and Run**
```bash
# Build image
docker build -t momeet:latest .

# Run container
docker run -p 3000:3000 \
  --env-file .env.local \
  --name momeet \
  momeet:latest

# Run in background
docker run -d \
  -p 3000:3000 \
  --env-file .env.local \
  --name momeet \
  momeet:latest
```

**Step 3: Docker Compose (Recommended)**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_STREAM_API_KEY=${NEXT_PUBLIC_STREAM_API_KEY}
      - STREAM_SECRET_KEY=${STREAM_SECRET_KEY}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Deploy:
```bash
docker-compose up -d
```

---

## Nginx Configuration

### Reverse Proxy Setup

```nginx
upstream momeet {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Performance optimizations
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    gzip_proxied any;

    # Proxy settings
    location / {
        proxy_pass http://momeet;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static files
    location /_next {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /static {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable SSL:
```bash
sudo certbot certonly --nginx -d yourdomain.com
sudo nginx -s reload
```

---

## Database & Storage Setup

### Stream.io Configuration

1. Create account at https://dashboard.getstream.io/
2. Create a new application
3. Get your API key and secret
4. Create channels and permissions as needed

### Google Cloud Storage (Optional)

For meeting recordings backup:

```bash
# Create bucket
gsutil mb -l us-central1 gs://your-bucket-name

# Set permissions
gsutil iam ch serviceAccount:your-service@project.iam.gserviceaccount.com:objectCreator gs://your-bucket-name
```

---

## SSL/TLS Setup

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Certificate Renewal
```bash
# Manual renewal
sudo certbot renew

# Test renewal (dry run)
sudo certbot renew --dry-run
```

---

## Monitoring & Logging

### Application Logging

```bash
# View application logs
docker logs momeet

# Follow logs in real-time
docker logs -f momeet

# Save logs to file
docker logs momeet > app.log 2>&1
```

### PM2 (Alternative to Docker)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "momeet" -- start

# Monitor
pm2 monit

# View logs
pm2 logs momeet

# Setup auto-restart
pm2 startup
pm2 save
```

---

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build

# Production build
npm run build
npm start
```

### Caching Strategy

```typescript
// next.config.mjs
export default {
  headers: async () => {
    return [
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

---

## Security Best Practices

### 1. Environment Variables
```bash
# Never commit .env.local
echo ".env.local" >> .gitignore

# Use vault for secrets in production
```

### 2. Rate Limiting
```typescript
// middleware.ts
import { rateLimit } from '@/lib/rate-limit';

export function middleware(request: NextRequest) {
  return rateLimit(request);
}
```

### 3. CORS Configuration
```typescript
// next.config.mjs
export default {
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://yourdomain.com',
          },
        ],
      },
    ];
  },
};
```

### 4. CSP Headers
```typescript
headers: [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' getstream.io; style-src 'self' 'unsafe-inline'",
  },
]
```

---

## Backup & Recovery

### Database Backup
```bash
# Backup Stream.io data
curl -X GET https://api.getstream.io/api/v1/me \
  -H "Authorization: Bearer $STREAM_SECRET_KEY"

# Store in secure location
```

### Application Backup
```bash
# Backup configuration
tar -czf backup-$(date +%Y%m%d).tar.gz .env.local

# Backup to remote storage
gsutil cp backup-*.tar.gz gs://your-backup-bucket/
```

---

## Monitoring Checklist

- [ ] Application uptime monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (New Relic, DataDog)
- [ ] Security scanning
- [ ] Log aggregation (ELK stack)
- [ ] Alert setup for critical errors

---

## Support

For deployment issues:
- Check application logs
- Verify environment variables
- Test Stream.io connectivity
- Verify Clerk configuration
- Check firewall/port settings

---

## Quick Reference

**Restart Service**
```bash
docker restart momeet
# or
pm2 restart momeet
```

**Check Logs**
```bash
docker logs -f momeet
# or
pm2 logs momeet
```

**Update Application**
```bash
git pull origin main
npm install
npm run build
docker build -t momeet:latest .
docker run -d momeet:latest
```

**Rollback**
```bash
docker run -d momeet:previous-version
# or revert git commit and redeploy
```

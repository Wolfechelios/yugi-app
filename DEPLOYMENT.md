# 🚀 Deployment Guide

This guide covers various deployment options for DuelVault.

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Database (SQLite for development, PostgreSQL for production)

## 🌐 Vercel (Recommended)

### Automatic Deployment

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   ```
   DATABASE_URL="postgresql://user:password@host:port/database"
   NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
   ```

3. **Deploy**
   - Vercel will automatically detect Next.js
   - Deployment takes 2-3 minutes
   - Your app will be live at `your-app.vercel.app`

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## 🐳 Docker Deployment

### Build Docker Image

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Deploy with Docker

```bash
# Build image
docker build -t duelvault .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./dev.db" \
  -e NODE_ENV=production \
  duelvault
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/duelvault
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=duelvault
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🖥️ Traditional Hosting

### Build for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm start
```

### Environment Setup

Create `.env.production`:
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:port/database"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### PM2 Process Manager

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "duelvault" -- start

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

## ☁️ Cloud Providers

### AWS

#### Using AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**
   - Set in Amplify Console
   - `DATABASE_URL`, `NODE_ENV`, etc.

#### Using EC2

```bash
# Connect to EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/your-username/duelvault.git
cd duelvault

# Install and run
npm install
npm run build
npm start
```

### Google Cloud Platform

#### Using Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/duelvault

# Deploy to Cloud Run
gcloud run deploy duelvault \
  --image gcr.io/PROJECT-ID/duelvault \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure

#### Using Azure App Service

```bash
# Install Azure CLI
npm install -g azure-cli

# Login to Azure
az login

# Deploy
az webapp up \
  --name duelvault \
  --resource-group duelvault-rg \
  --location centralus \
  --sku B1 \
  --runtime "NODE|18-lts"
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `DATABASE_URL` | Database connection | `postgresql://...` |
| `NEXT_PUBLIC_APP_URL` | App URL | `https://app.domain.com` |
| `PORT` | Server port | `3000` |

### Database Setup

#### PostgreSQL (Production)

```bash
# Create database
createdb duelvault

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

#### SQLite (Development)

```bash
# Push schema
npm run db:push

# Generate client
npm run db:generate
```

## 🔒 Security

### SSL/HTTPS

- **Vercel**: Automatic SSL
- **Custom Domain**: Use Let's Encrypt
- **Nginx**: Configure SSL certificates

### Environment Security

```bash
# Secure environment files
chmod 600 .env.production

# Use secrets management
# AWS Secrets Manager, Azure Key Vault, etc.
```

### API Security

- Rate limiting
- Input validation
- CORS configuration
- Authentication middleware

## 📊 Monitoring

### Application Monitoring

```javascript
// Add monitoring (example with Sentry)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
});
```

### Performance Monitoring

- **Vercel Analytics**: Built-in performance metrics
- **Google Analytics**: User behavior tracking
- **Custom monitoring**: Winston logging, Prometheus metrics

## 🚀 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify environment variables
   - Review build logs

2. **Database Connection**
   - Verify connection string
   - Check network accessibility
   - Confirm database is running

3. **Static Assets**
   - Ensure proper public folder structure
   - Check CDN configuration
   - Verify asset paths

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Production debugging
NODE_ENV=production DEBUG=* npm start
```

## 📈 Performance Optimization

### Build Optimization

```javascript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

### Database Optimization

- Add proper indexes
- Use connection pooling
- Implement caching strategies
- Monitor query performance

---

For additional help, check the [main documentation](README.md) or create an issue on GitHub.
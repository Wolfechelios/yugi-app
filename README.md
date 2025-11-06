# 🎴 DuelVault - Yu-Gi-Oh! Card Collection Manager

A comprehensive Next.js application for managing Yu-Gi-Oh! card collections with advanced OCR scanning capabilities, manual entry, and AI-powered features.

## ✨ Features

### 📸 **Card Scanning & OCR**
- **Advanced OCR Integration**: Tesseract.js powered text recognition
- **Image Processing**: Automatic enhancement for better accuracy
- **Real-time Progress**: Live scanning feedback with confidence scores
- **Batch Processing**: Scan multiple cards simultaneously
- **Component Extraction**: Intelligent parsing of card names, stats, and effects

### 📝 **Manual Card Entry**
- **Comprehensive Forms**: Complete card information input
- **Smart Templates**: Pre-built templates for common card types
- **JSON Import**: Support for YGOJSON and other card data formats
- **Live Preview**: Real-time card preview as you type
- **Validation**: Smart form validation with helpful error messages

### 🔍 **Card Management**
- **Collection Organization**: Multiple collections with custom names
- **Search & Filter**: Powerful search across all card attributes
- **Statistics Dashboard**: Track collection value and growth
- **Scan History**: Complete history of all scanned cards
- **Rarity Tracking**: Automatic rarity classification

### 🤖 **AI Features**
- **Synthetic Data Generation**: AI-powered training data creation
- **Smart Recognition**: Machine learning for card identification
- **WebSocket Integration**: Real-time updates and notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yugioh-card-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run db:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📖 Usage Guide

### 📸 Scanning Cards

1. **Quick Scan**: Click the "Scan Card" button in the header
2. **Batch Scan**: Use the "Batch Scan" option for multiple cards
3. **Upload Images**: Drag & drop or select card images
4. **Review Results**: Check OCR accuracy and extracted information
5. **Save to Collection**: Add verified cards to your collection

### 📝 Manual Entry

1. **Navigate**: Go to "Manual Entry" tab
2. **Choose Method**: 
   - Fill form manually
   - Use templates for common cards
   - Import JSON data
3. **Validate**: Check the live preview
4. **Save**: Add to your collection

### 🔍 Managing Collections

1. **Create Collections**: Organize cards by theme, deck, or category
2. **Search Cards**: Use the search tab to find specific cards
3. **View Statistics**: Track your collection growth in the dashboard
4. **Export Data**: Download your collection data (coming soon)

## 🛠️ Technical Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern component library
- **Lucide React**: Beautiful icons

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Database management
- **SQLite**: Lightweight database
- **Socket.IO**: Real-time communication
- **Tesseract.js**: OCR text recognition
- **Sharp**: Image processing

### Development Tools
- **ESLint**: Code quality
- **TypeScript**: Static typing
- **Prettier**: Code formatting
- **Nodemon**: Auto-restart development

## 📁 Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   └── page.tsx        # Main dashboard
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── cards/         # Card-related components
│   │   ├── scan/          # Scanning components
│   │   └── ...
│   └── lib/               # Utility libraries
├── prisma/                # Database schema
├── public/                # Static assets
├── examples/              # Example components
└── db/                    # Database files
```

## 🧪 Testing

### CLI Testing Tool
Use the built-in CLI tool for testing card scanning:

```bash
node test-scanner-cli.js
```

### Manual Testing
1. Open `test-scanner.html` in your browser
2. Upload card images to test OCR functionality
3. Verify extracted information matches expectations

### Test Images
Place test card images as:
- `test-card.jpg`
- `test-card.png`

## 📊 API Endpoints

### Core Endpoints
- `POST /api/init` - Initialize user session
- `POST /api/scan` - Scan card image with OCR
- `GET /api/collections` - Get user collections
- `POST /api/collections` - Create new collection
- `POST /api/cards/manual` - Add card manually

### Utility Endpoints
- `GET /api/stats` - Get collection statistics
- `GET /api/scans/history` - Get scan history
- `POST /api/synthetic/generate` - Generate synthetic data

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Setup
```bash
# Push schema to database
npm run db:push

# View database
npm run db:studio
```

## 🎯 Card Data Format

The app supports YGOJSON format for importing cards:

```json
{
  "id": "card-id",
  "text": {
    "en": {
      "name": "Card Name",
      "effect": "Card effect text"
    }
  },
  "cardType": "monster",
  "attribute": "light",
  "level": 8,
  "atk": 3000,
  "def": 2500
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically

### Docker
```bash
# Build image
docker build -t yugioh-card-manager .

# Run container
docker run -p 3000:3000 yugioh-card-manager
```

### Traditional Hosting
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 Development Notes

### OCR Accuracy Tips
- Use clear, well-lit images
- Ensure text is in focus
- Avoid glare and shadows
- Use high-resolution images when possible

### Performance Optimization
- Images are automatically resized and optimized
- OCR processing runs in Web Workers
- Database queries are optimized with proper indexing
- Static assets are served from CDN in production

## 🐛 Troubleshooting

### Common Issues
1. **Server not accessible**: Check if port 3000 is available
2. **OCR not working**: Verify Tesseract.js is properly loaded
3. **Database errors**: Run `npm run db:push` to sync schema
4. **Image upload fails**: Check file size limits (500MB max)

### Debug Mode
Enable debug logging:
```bash
DEBUG=* npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Yu-Gi-Oh!** - Card game and artwork
- **Tesseract.js** - OCR engine
- **shadcn/ui** - Component library
- **Prisma** - Database toolkit
- **Next.js** - React framework

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting guide
- Review the API documentation

---

**Built with ❤️ for Yu-Gi-Oh! fans and collectors**
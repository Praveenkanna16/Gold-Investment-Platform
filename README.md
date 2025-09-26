# Gold Investment Platform (MVP v1)

A production-ready, secure, and scalable gold investment platform built with modern technologies.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Redux Toolkit + Tailwind CSS
- **Backend**: NestJS + TypeScript + PostgreSQL
- **Payment**: Razorpay/Stripe integration (test mode)
- **Security**: JWT auth, bcrypt, Helmet, input validation
- **Testing**: Unit, Integration, E2E tests
- **Deployment**: Docker, CI/CD, AWS/GCP ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd gold-investment-platform
npm install
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Configure your database and API keys in .env
npm run migration:run
npm run seed
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Configure API endpoints in .env
```

### Development

```bash
# Run both frontend and backend
npm run dev

# Or run separately
npm run dev:backend  # Backend on http://localhost:3000
npm run dev:frontend # Frontend on http://localhost:3001
```

### Docker Deployment

```bash
# Build and run with Docker Compose
npm run docker:build
npm run docker:up
```

## 📁 Project Structure

```
gold-investment-platform/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── gold/           # Gold trading logic
│   │   ├── transactions/   # Transaction handling
│   │   ├── payments/       # Payment gateway integration
│   │   ├── admin/          # Admin panel APIs
│   │   └── common/         # Shared utilities
│   ├── test/               # E2E tests
│   └── migrations/         # Database migrations
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store
│   │   ├── services/       # API services
│   │   └── utils/          # Utilities
│   └── public/             # Static assets
├── docker-compose.yml      # Docker configuration
└── .github/workflows/      # CI/CD pipelines
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention
- XSS protection

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend

# E2E tests
npm run test:e2e
```

## 📊 Features

### User Features
- User registration and login
- Real-time gold price tracking
- Buy gold with payment gateway
- View gold balance and portfolio
- Transaction history
- Profile management

### Admin Features
- User management dashboard
- Transaction monitoring
- System analytics
- Gold price management

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://user:password@localhost:5432/gold_platform
JWT_SECRET=your-jwt-secret
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
GOLD_API_KEY=your-gold-price-api-key
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_RAZORPAY_KEY_ID=your-razorpay-key
```

## 🚀 Deployment

### AWS Deployment
1. Setup RDS PostgreSQL instance
2. Deploy backend to EC2 or ECS
3. Deploy frontend to S3 + CloudFront
4. Configure environment variables

### GCP Deployment
1. Setup Cloud SQL PostgreSQL
2. Deploy backend to Cloud Run
3. Deploy frontend to Cloud Storage + CDN
4. Configure environment variables

### Docker Deployment
```bash
docker-compose up -d
```

## 📈 API Documentation

API documentation is available at `/api/docs` when running the backend in development mode.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

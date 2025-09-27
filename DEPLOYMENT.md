# Gold Investment Platform - Production Deployment Guide

## 🚀 Quick Deploy (AWS)

### Prerequisites
- AWS CLI configured with appropriate permissions
- Docker installed
- Node.js 18+ installed

### 1. Database Setup (RDS PostgreSQL)
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier gold-platform-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 14.9 \
  --master-username goldadmin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name your-subnet-group \
  --backup-retention-period 7 \
  --multi-az \
  --storage-encrypted
```

### 2. Backend Deployment (ECS Fargate)

#### Build and Push to ECR
```bash
# Create ECR repository
aws ecr create-repository --repository-name gold-platform-backend

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build and push
cd backend
docker build -t gold-platform-backend .
docker tag gold-platform-backend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/gold-platform-backend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/gold-platform-backend:latest
```

#### ECS Task Definition
```json
{
  "family": "gold-platform-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "gold-platform-backend",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/gold-platform-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3000"},
        {"name": "API_PREFIX", "value": "api/v1"}
      ],
      "secrets": [
        {"name": "DATABASE_URL", "valueFrom": "arn:aws:ssm:us-east-1:123456789012:parameter/gold-platform/database-url"},
        {"name": "JWT_SECRET", "valueFrom": "arn:aws:ssm:us-east-1:123456789012:parameter/gold-platform/jwt-secret"},
        {"name": "PHONEPE_MERCHANT_ID", "valueFrom": "arn:aws:ssm:us-east-1:123456789012:parameter/gold-platform/phonepe-merchant-id"},
        {"name": "PHONEPE_SALT_KEY", "valueFrom": "arn:aws:ssm:us-east-1:123456789012:parameter/gold-platform/phonepe-salt-key"},
        {"name": "PHONEPE_SALT_INDEX", "valueFrom": "arn:aws:ssm:us-east-1:123456789012:parameter/gold-platform/phonepe-salt-index"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/gold-platform-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### 3. Frontend Deployment (S3 + CloudFront)

#### Build and Deploy
```bash
cd frontend
npm run build

# Create S3 bucket
aws s3 mb s3://gold-platform-frontend-prod

# Enable static website hosting
aws s3 website s3://gold-platform-frontend-prod --index-document index.html --error-document index.html

# Upload build files
aws s3 sync dist/ s3://gold-platform-frontend-prod --delete

# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

#### CloudFront Configuration
```json
{
  "CallerReference": "gold-platform-frontend-2024",
  "Comment": "Gold Investment Platform Frontend",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-gold-platform-frontend",
        "DomainName": "gold-platform-frontend-prod.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-gold-platform-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    }
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
```

### 4. Load Balancer & SSL

#### Application Load Balancer
```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name gold-platform-alb \
  --subnets subnet-12345678 subnet-87654321 \
  --security-groups sg-xxxxxxxxx \
  --scheme internet-facing \
  --type application

# Create target group
aws elbv2 create-target-group \
  --name gold-platform-backend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-12345678 \
  --target-type ip \
  --health-check-path /

# Create HTTPS listener (requires ACM certificate)
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/gold-platform-alb/1234567890123456 \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/gold-platform-backend-tg/1234567890123456
```

### 5. Environment Variables (SSM Parameter Store)

```bash
# Database
aws ssm put-parameter --name "/gold-platform/database-url" --value "postgresql://goldadmin:YourSecurePassword123!@gold-platform-prod.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/postgres" --type "SecureString"

# JWT
aws ssm put-parameter --name "/gold-platform/jwt-secret" --value "your-super-secure-jwt-secret-256-bits-long" --type "SecureString"

# PhonePe (Production)
aws ssm put-parameter --name "/gold-platform/phonepe-merchant-id" --value "your_merchant_id" --type "SecureString"
aws ssm put-parameter --name "/gold-platform/phonepe-salt-key" --value "your_salt_key" --type "SecureString"
aws ssm put-parameter --name "/gold-platform/phonepe-salt-index" --value "1" --type "String"

# CORS
aws ssm put-parameter --name "/gold-platform/cors-origin" --value "https://your-frontend-domain.com" --type "String"
```

### 6. Database Migration

```bash
# Connect to RDS and run migrations
cd backend
export DATABASE_URL="postgresql://goldadmin:YourSecurePassword123!@gold-platform-prod.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/postgres"
npm run migration:run
npm run seed
```

### 7. Monitoring & Alerts

#### CloudWatch Alarms
```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "gold-platform-high-error-rate" \
  --alarm-description "High 5xx error rate" \
  --metric-name "HTTPCode_Target_5XX_Count" \
  --namespace "AWS/ApplicationELB" \
  --statistic "Sum" \
  --period 300 \
  --threshold 10 \
  --comparison-operator "GreaterThanThreshold" \
  --evaluation-periods 2

# High response time alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "gold-platform-high-latency" \
  --alarm-description "High response time" \
  --metric-name "TargetResponseTime" \
  --namespace "AWS/ApplicationELB" \
  --statistic "Average" \
  --period 300 \
  --threshold 2.0 \
  --comparison-operator "GreaterThanThreshold" \
  --evaluation-periods 2
```

## 🔒 Security Checklist

### Pre-Deployment
- [ ] All secrets stored in AWS SSM Parameter Store
- [ ] Database credentials rotated and secured
- [ ] JWT secret is 256+ bits and unique
- [ ] Payment webhook secrets configured
- [ ] CORS origins restricted to production domains
- [ ] Rate limiting enabled (100 req/min default)
- [ ] Input validation enabled globally
- [ ] SQL injection protection via TypeORM
- [ ] XSS protection via Helmet CSP

### Post-Deployment
- [ ] SSL/TLS certificate installed and working
- [ ] Security headers verified (HSTS, CSP, etc.)
- [ ] Database access restricted to application subnets
- [ ] CloudWatch logging enabled
- [ ] Backup strategy implemented (RDS automated backups)
- [ ] Monitoring and alerting configured
- [ ] Load testing completed
- [ ] Penetration testing scheduled

## 🚦 Health Checks

### Backend Health Endpoints
- `GET /` - Basic health check
- `GET /status` - Detailed system status
- `GET /api/v1/gold/price` - Service dependency check

### Frontend Health
- CloudFront distribution status
- S3 bucket accessibility
- Asset loading verification

## 📊 Performance Optimization

### Database
- Indexes added for common queries (users, transactions)
- Connection pooling configured
- Query optimization enabled
- Read replicas for scaling (optional)

### Backend
- Compression enabled
- Caching headers set
- Rate limiting implemented
- Memory usage monitoring

### Frontend
- Static assets cached (30 days)
- Gzip compression enabled
- CDN distribution via CloudFront
- Bundle size optimized

## 🔄 CI/CD Pipeline

The GitHub Actions workflows are already configured:
- `backend-ci.yml` - Backend build, test, deploy
- `frontend-ci.yml` - Frontend build, test, deploy

### Manual Deployment Commands
```bash
# Backend deployment
cd backend
docker build -t gold-platform-backend .
docker tag gold-platform-backend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/gold-platform-backend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/gold-platform-backend:latest

# Update ECS service
aws ecs update-service --cluster gold-platform --service gold-platform-backend --force-new-deployment

# Frontend deployment
cd frontend
npm run build
aws s3 sync dist/ s3://gold-platform-frontend-prod --delete
aws cloudfront create-invalidation --distribution-id EXXXXXXXXX --paths "/*"
```

## 🆘 Troubleshooting

### Common Issues
1. **Database connection failed**: Check RDS security groups and credentials
2. **CORS errors**: Verify CORS_ORIGIN environment variable
3. **Payment webhook failures**: Check webhook URL and secrets
4. **High memory usage**: Monitor ECS task memory and scale if needed
5. **SSL certificate issues**: Verify ACM certificate and ALB listener

### Logs Location
- Backend: CloudWatch Logs `/ecs/gold-platform-backend`
- Frontend: CloudFront access logs
- Database: RDS logs in CloudWatch

### Support Contacts
- DevOps: devops@yourcompany.com
- Security: security@yourcompany.com
- On-call: +1-xxx-xxx-xxxx

---

**🎉 Your Gold Investment Platform is now production-ready!**

Access your application at: `https://your-domain.com`
API Documentation: `https://api.your-domain.com/api/v1/docs`

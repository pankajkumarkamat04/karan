# Environment Variables Configuration

This document lists all environment variables required for the backend application.

## How to Use

1. Create a `.env` file in the `backend` directory
2. Copy the variables below and fill in your actual values
3. Never commit the `.env` file to version control

---

## Environment Variables List

### Application Configuration
```env
APP_NAME=YourAppName
APP_KEY=your-app-secret-key-change-this-in-production
APP_URL=http://localhost:4000
CLIENT_APP_URL=http://localhost:3000
PORT=4000
NODE_ENV=development
```

### Database Configuration
```env
# PostgreSQL Database URL
# Format: postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
DATABASE_URL=postgresql://postgres:root@localhost:5432/ecommerce
```

### Redis Configuration
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### JWT Configuration
```env
JWT_SECRET=your-jwt-secret-key-change-this-in-production
JWT_EXPIRY=7d
```

### AWS S3 / MINIO Storage Configuration
```env
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket-name
AWS_URL=https://your-bucket.s3.amazonaws.com
AWS_ENDPOINT=http://localhost:9000
```

### Email Configuration (SMTP)
```env
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_NAME=YourAppName
```

### Stripe Payment Configuration
```env
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_WEBHOOK_SECRET_KEY=whsec_your-webhook-secret-key
STRIPE_STARTER_PLAN=price_your-starter-plan-id
STRIPE_PRO_PLAN=price_your-pro-plan-id
```

### UPI Payment Configuration (EZUPI)
```env
EZ_UPI_API_KEY=your-ezupi-api-key
EZ_UPI_API_URL=https://ezupi.com/api
CALLBACK_URL=http://localhost:4000/api/payment/upi/callback
SUCCESS_REDIRECT_URL=http://localhost:3000/payment/success
FAILURE_REDIRECT_URL=http://localhost:3000/payment/failure
```

### Mobalegends Payment Configuration
```env
MOBILEGENDS_API_KEY=your-mobalegends-api-key
MOBILEGENDS_API_URL=https://gateway.mobalegends.in/api
```

### OneAPI SMS Configuration
```env
ONEAPI_API_KEY=your-oneapi-api-key
```

### System Default User Configuration
```env
SYSTEM_USERNAME=admin
SYSTEM_EMAIL=admin@example.com
SYSTEM_PASSWORD=change-this-password
```

### Backend App URL (for image URLs)
```env
BACKEND_APP_URL=http://localhost:4000
```

### Prisma Configuration (Optional)
```env
# Set to '1' to disable Prisma middleware (useful for seeding)
PRISMA_ENV=0
```

### Docker / Development Configuration
```env
# Required for hot-reloading to work on Windows
CHOKIDAR_USEPOLLING=true
CHOKIDAR_INTERVAL=1000
```

### WebRTC TURN Server Configuration (Optional)
```env
TURN_SERVER=turn:turnserver:3478
TURN_USERNAME=webrtc
TURN_PASSWORD=strongpassword
```

---

## Complete .env File Template

Copy this entire block to create your `.env` file:

```env
# ============================================
# APPLICATION CONFIGURATION
# ============================================
APP_NAME=YourAppName
APP_KEY=your-app-secret-key-change-this-in-production
APP_URL=http://localhost:4000
CLIENT_APP_URL=http://localhost:3000
PORT=4000
NODE_ENV=development

# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL=postgresql://postgres:root@localhost:5432/ecommerce

# ============================================
# REDIS CONFIGURATION
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_SECRET=your-jwt-secret-key-change-this-in-production
JWT_EXPIRY=7d

# ============================================
# AWS S3 / MINIO STORAGE CONFIGURATION
# ============================================
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket-name
AWS_URL=https://your-bucket.s3.amazonaws.com
AWS_ENDPOINT=http://localhost:9000

# ============================================
# EMAIL CONFIGURATION (SMTP)
# ============================================
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_NAME=YourAppName

# ============================================
# STRIPE PAYMENT CONFIGURATION
# ============================================
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_WEBHOOK_SECRET_KEY=whsec_your-webhook-secret-key
STRIPE_STARTER_PLAN=price_your-starter-plan-id
STRIPE_PRO_PLAN=price_your-pro-plan-id

# ============================================
# UPI PAYMENT CONFIGURATION (EZUPI)
# ============================================
EZ_UPI_API_KEY=your-ezupi-api-key
EZ_UPI_API_URL=https://ezupi.com/api
CALLBACK_URL=http://localhost:4000/api/payment/upi/callback
SUCCESS_REDIRECT_URL=http://localhost:3000/payment/success
FAILURE_REDIRECT_URL=http://localhost:3000/payment/failure

# ============================================
# MOBALEGENDS PAYMENT CONFIGURATION
# ============================================
MOBILEGENDS_API_KEY=your-mobalegends-api-key
MOBILEGENDS_API_URL=https://gateway.mobalegends.in/api

# ============================================
# ONEAPI SMS CONFIGURATION
# ============================================
ONEAPI_API_KEY=your-oneapi-api-key

# ============================================
# SYSTEM DEFAULT USER CONFIGURATION
# ============================================
SYSTEM_USERNAME=admin
SYSTEM_EMAIL=admin@example.com
SYSTEM_PASSWORD=change-this-password

# ============================================
# BACKEND APP URL (for image URLs)
# ============================================
BACKEND_APP_URL=http://localhost:4000

# ============================================
# PRISMA CONFIGURATION (Optional)
# ============================================
PRISMA_ENV=0

# ============================================
# DOCKER / DEVELOPMENT CONFIGURATION
# ============================================
# Required for hot-reloading to work on Windows
CHOKIDAR_USEPOLLING=true
CHOKIDAR_INTERVAL=1000

# ============================================
# WEBRTC TURN SERVER CONFIGURATION (Optional)
# ============================================
TURN_SERVER=turn:turnserver:3478
TURN_USERNAME=webrtc
TURN_PASSWORD=strongpassword

# ============================================
# CONTACT INFORMATION (For Banned Users)
# ============================================
CONTACT_EMAIL=support@example.com
CONTACT_PHONE=+1-800-XXX-XXXX
```

---

## Notes

- **Required Variables**: All variables listed above are required unless marked as optional
- **Security**: Never commit your `.env` file to version control
- **Production**: Change all default values and use strong secrets in production
- **Database**: Update `DATABASE_URL` with your actual PostgreSQL connection string
  - For local development: `postgresql://postgres:root@localhost:5432/ecommerce`
  - For Docker: `postgresql://postgres:root@postgres/ecommerce`
- **Redis**: 
  - For local development: `REDIS_HOST=localhost`
  - For Docker: `REDIS_HOST=redis`
- **Payment Gateways**: Configure at least one payment gateway (Stripe, UPI, or Mobalegends) based on your needs
- **Email**: For Gmail, you'll need to use an App Password instead of your regular password
- **Docker**: The `docker-compose.yml` file already includes some environment variables. When running with Docker, those values will override the `.env` file for the containerized services.


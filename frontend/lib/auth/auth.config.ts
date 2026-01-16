import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  database: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || './todo.db',
  },
  secret: process.env.BETTER_AUTH_SECRET || 'your-super-secret-key-change-in-production',
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
  },
  email: {
    enabled: true,
    from: process.env.SMTP_FROM || 'noreply@todo-app.com',
    transport: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    },
  },
});
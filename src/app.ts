import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppError } from './utils/AppError';
import { env } from './config/env';

import authRoutes from './modules/auth/auth.routes';
import tenantRoutes from './modules/tenants/tenants.routes';
import propertyRoutes from './modules/properties/properties.routes';
import landlordRoutes from './modules/landlords/landlords.routes';
import leaseRoutes from './modules/leases/leases.routes';
import invoiceRoutes from './modules/invoices/invoices.routes';
import paymentRoutes from './modules/payments/payments.routes';
import maintenanceRoutes from './modules/maintenance/maintenance.routes';
import reportRoutes from './modules/reports/reports.routes';
import usersRoutes from './modules/users/users.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://property-mgt.netlify.app'], // Vite default ports & Netlify
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Property Management API is running');
});

console.log('Registering auth routes...');
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/leases', leaseRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/landlords', landlordRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/payments', paymentRoutes);

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production: don't leak stack traces
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
});

export default app;

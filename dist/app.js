"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const AppError_1 = require("./utils/AppError");
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const tenants_routes_1 = __importDefault(require("./modules/tenants/tenants.routes"));
const properties_routes_1 = __importDefault(require("./modules/properties/properties.routes"));
const landlords_routes_1 = __importDefault(require("./modules/landlords/landlords.routes"));
const leases_routes_1 = __importDefault(require("./modules/leases/leases.routes"));
const invoices_routes_1 = __importDefault(require("./modules/invoices/invoices.routes"));
const payments_routes_1 = __importDefault(require("./modules/payments/payments.routes"));
const maintenance_routes_1 = __importDefault(require("./modules/maintenance/maintenance.routes"));
const reports_routes_1 = __importDefault(require("./modules/reports/reports.routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Routes
app.get('/', (req, res) => {
    res.send('Property Management API is running');
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/tenants', tenants_routes_1.default);
app.use('/api/properties', properties_routes_1.default);
app.use('/api/landlords', landlords_routes_1.default);
app.use('/api/leases', leases_routes_1.default);
app.use('/api/invoices', invoices_routes_1.default);
app.use('/api/payments', payments_routes_1.default);
app.use('/api/maintenance', maintenance_routes_1.default);
app.use('/api/reports', reports_routes_1.default);
// 404 Handler
app.all('*', (req, res, next) => {
    next(new AppError_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Global Error Handler
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (env_1.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }
    else {
        // Production: don't leak stack traces
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        else {
            console.error('ERROR 💥', err);
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!',
            });
        }
    }
});
exports.default = app;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const auth_service_1 = require("./auth.service");
const catchAsync_1 = require("../../utils/catchAsync");
const zod_1 = require("zod");
const authService = new auth_service_1.AuthService();
const registerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['ADMIN', 'STAFF']).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.register = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = registerSchema.parse(req.body);
    const { user, token } = await authService.register({
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.password,
        role: data.role,
    });
    res.status(201).json({
        status: 'success',
        token,
        data: { user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } },
    });
});
exports.login = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = loginSchema.parse(req.body);
    const { user, token } = await authService.login(data.email, data.password);
    res.status(200).json({
        status: 'success',
        token,
        data: { user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } },
    });
});

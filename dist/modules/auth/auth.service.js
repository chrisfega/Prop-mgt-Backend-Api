"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../database/prisma"));
const AppError_1 = require("../../utils/AppError");
const env_1 = require("../../config/env");
class AuthService {
    async register(data) {
        const existingUser = await prisma_1.default.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            throw new AppError_1.AppError('Email already in use', 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.passwordHash, 12);
        const user = await prisma_1.default.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                passwordHash: hashedPassword,
                role: data.role || client_1.Role.STAFF,
            },
        });
        const token = this.signToken(user.id);
        return { user, token };
    }
    async login(email, passwordHash) {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !(await bcryptjs_1.default.compare(passwordHash, user.passwordHash))) {
            throw new AppError_1.AppError('Incorrect email or password', 401);
        }
        const token = this.signToken(user.id);
        return { user, token };
    }
    signToken(id) {
        return jsonwebtoken_1.default.sign({ id }, env_1.env.JWT_SECRET, {
            expiresIn: '1d',
        });
    }
}
exports.AuthService = AuthService;

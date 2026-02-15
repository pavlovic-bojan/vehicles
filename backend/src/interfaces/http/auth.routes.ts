import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, type AuthRequest } from '../../middleware/auth.js';
import * as authController from './auth.controller.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               role: { type: string, enum: [ADMIN, DRIVER, AUDITOR] }
 *     responses:
 *       201:
 *         description: Registered, returns JWT and user
 *       400:
 *         description: Validation error or email already exists
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['ADMIN', 'DRIVER', 'AUDITOR']).withMessage('Invalid role'),
  ],
  (req, res, next) => authController.register(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login success, returns JWT and user
 *       401:
 *         description: Invalid email or password
 */
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').trim().notEmpty().withMessage('Password is required'),
  ],
  (req, res, next) => authController.login(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: If account exists, reset token created
 */
router.post(
  '/forgot-password',
  body('email').trim().isEmail().withMessage('Valid email is required'),
  (req, res, next) => authController.forgotPassword(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Set new password using reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post(
  '/reset-password',
  [
    body('token').trim().notEmpty().withMessage('Token is required'),
    body('newPassword').trim().isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  (req, res, next) => authController.resetPassword(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Login with Google OAuth id_token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID token from client
 *     responses:
 *       200:
 *         description: Login success, returns JWT and user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     token: { type: string }
 *                     user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid Google token
 */
router.post(
  '/google',
  body('idToken').trim().notEmpty().withMessage('idToken is required'),
  (req, res, next) => authController.loginGoogle(req as any, res).catch(next)
);

/**
 * @swagger
 * /api/auth/facebook:
 *   post:
 *     summary: Login with Facebook OAuth access_token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accessToken]
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: Facebook access token from client
 *     responses:
 *       200:
 *         description: Login success, returns JWT and user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     token: { type: string }
 *                     user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid Facebook token
 */
router.post(
  '/facebook',
  body('accessToken').trim().notEmpty().withMessage('accessToken is required'),
  (req, res, next) => authController.loginFacebook(req as any, res).catch(next)
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticate, (req, res, next) =>
  authController.getMe(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/auth/audit:
 *   get:
 *     summary: List login audit log (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 200
 *     responses:
 *       200:
 *         description: List of login audit entries
 *       403:
 *         description: Admin only
 */
router.get('/audit', authenticate, (req, res, next) =>
  authController.listAudit(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/auth/dev:
 *   post:
 *     summary: Dev-only login with secret (only when DEV_AUTH_SECRET is set)
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [secret]
 *             properties:
 *               secret: { type: string }
 *     responses:
 *       200:
 *         description: Login success
 *       401:
 *         description: Invalid secret
 *       404:
 *         description: Dev auth not enabled
 */
router.post(
  '/dev',
  body('secret').trim().notEmpty().withMessage('secret is required'),
  (req, res, next) => authController.devLogin(req as AuthRequest, res).catch(next)
);

export default router;

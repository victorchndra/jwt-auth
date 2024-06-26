import express from 'express';
import { getUsers, Register, Login, Logout } from '../controllers/Users.js';
import { verifyToken } from '../middleware/VerifyToken.js';
import { refreshToken } from '../controllers/RefreshToken.js';

const router = express.Router();

router.get('/users', verifyToken, getUsers); //endpoint /users tidak dpt diakses jika tidak login
router.post('/users', Register);
router.post('/login', Login);
router.get('/token', refreshToken);
router.delete('/logout', Logout);

export default router;
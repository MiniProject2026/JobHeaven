import express from 'express';
import { isAuth } from '../middleware/auth';
import { getUserProfile, myProfile, updateProfilepic, updateUserProfile } from '../controllers/user';
import uploadFile from '../middleware/multer';

const router = express.Router();

router.get("/me",isAuth,myProfile);
router.get("/:userId", isAuth, getUserProfile);
router.put("/update/pic", isAuth,uploadFile,  updateProfilepic);


export default router;

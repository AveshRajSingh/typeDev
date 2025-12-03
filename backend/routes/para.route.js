import {Router} from "express";
import { getPara, insertPara } from "../controllers/para.controller.js";



const router = Router();

router.post("/insert-para", insertPara);
router.post("/get-para",getPara)


export default router;

import express from "express";
import { urlCreation } from "../Controllers/url.js";
const UrlRouter=express.Router();


UrlRouter.post('/shorten',urlCreation)
export default UrlRouter;
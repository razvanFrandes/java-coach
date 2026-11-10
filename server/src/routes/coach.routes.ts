import { Router } from 'express';
import { analyze } from '../controllers/coach.controller';

export const coachRoutes = Router();

coachRoutes.post('/analyze', analyze);

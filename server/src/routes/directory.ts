import { Router, Request, Response } from 'express';
import { fetchTamilNaduDirectory } from '../services/overpassService.js';

export const directoryRouter = Router();

/**
 * GET /api/directory/tamilnadu
 * Returns statewide directory of EV charging stations in Tamil Nadu via Overpass API / 24h cache / fallback
 */
directoryRouter.get('/tamilnadu', async (req: Request, res: Response): Promise<void> => {
  try {
    const directory = await fetchTamilNaduDirectory();
    res.json(directory);
  } catch (error: any) {
    console.warn('[Directory Endpoint Error]:', error);
    res.status(500).json({
      error: 'DIRECTORY_FETCH_FAILED',
      message: 'Failed to retrieve Tamil Nadu station directory',
    });
  }
});

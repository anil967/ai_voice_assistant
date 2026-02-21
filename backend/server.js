/**
 * Local development server - run with: npm start
 */
import app, { PORT } from './app.js';
import logger from './utils/logger.js';

app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
});

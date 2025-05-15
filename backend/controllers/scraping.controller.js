const scrapingService = require('../services/scraping.service');

class ScrapingController {
  async getLocalNews(req, res) {
    try {
      console.log('Fetching local news...');
      const news = await scrapingService.scrapeAlmeriaDiary();
      console.log(`Found ${news.length} local articles`);
      
      res.json({
        status: 'success',
        articles: news
      });
    } catch (error) {
      console.error('Error getting local news:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error getting local news'
      });
    }
  }
}

module.exports = new ScrapingController();
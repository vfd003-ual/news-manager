const cheerio = require('cheerio');
const axios = require('axios');
const NodeCache = require('node-cache');

class ScrapingService {
  constructor() {
    this.baseUrl = 'https://www.diariodealmeria.es';
    this.axiosConfig = {
      timeout: 3000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
      },
      maxRedirects: 2
    };
    this.maxConcurrentRequests = 5;
    
    // Configurar cache
    this.cache = new NodeCache({ 
      stdTTL: 600,
      checkperiod: 120,
      useClones: false
    });
    
    this.CACHE_KEY_HOME = 'home_articles';
  }

  async scrapeAlmeriaDiary() {
    try {
      console.time('scraping');
      console.log('Comprobando caché...');

      // Intentar obtener datos de cache
      const cachedArticles = this.cache.get(this.CACHE_KEY_HOME);
      if (cachedArticles) {
        console.log('Datos obtenidos desde caché');
        console.timeEnd('scraping');
        return cachedArticles;
      }

      console.log('Iniciando scraping desde la web...');
      
      const mainPage = await axios.get(this.baseUrl, this.axiosConfig);
      const $ = cheerio.load(mainPage.data);
      
      const articles = await this.getArticlesFromHomepage($);
      console.log(`Encontrados ${articles.length} artículos`);

      const processedArticles = await this.processBatchesInParallel(articles);
      const formattedArticles = this.formatArticles(processedArticles);

      // Guardar en cache
      this.cache.set(this.CACHE_KEY_HOME, formattedArticles);
      
      console.timeEnd('scraping');
      return formattedArticles;

    } catch (error) {
      console.error('Error en scraping:', error.message);
      
      // En caso de error, intentar devolver cache expirada si existe
      const cachedArticles = this.cache.get(this.CACHE_KEY_HOME, true);
      if (cachedArticles) {
        console.log('Devolviendo caché expirada como fallback');
        return cachedArticles;
      }
      
      throw error;
    }
  }

  async processBatchesInParallel(articles) {
    const processedArticles = [];
    const batches = [];

    // Procesar solo los primeros 20 artículos para mejorar rendimiento
    const limitedArticles = articles.slice(0, 20);

    for (let i = 0; i < limitedArticles.length; i += this.maxConcurrentRequests) {
      batches.push(limitedArticles.slice(i, i + this.maxConcurrentRequests));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(article => {
        const cacheKey = `article_${article.url}`;
        const cachedArticle = this.cache.get(cacheKey);
        
        if (cachedArticle) {
          return Promise.resolve(cachedArticle);
        }

        return this.processArticleDetails(article)
          .then(processedArticle => {
            this.cache.set(cacheKey, processedArticle);
            return processedArticle;
          })
          .catch(err => {
            console.warn(`Error en artículo ${article.url}:`, err.message);
            return {
              ...article,
              content: 'Error al acceder al contenido',
              description: 'Descripción no disponible'
            };
          });
      });

      const results = await Promise.all(batchPromises);
      processedArticles.push(...results);
    }

    return processedArticles;
  }

  async getArticlesFromHomepage($) {
    const articles = new Set();
    const selectors = [
      '.opening', '.mlt-item', '.list-item', 
      'article', '.headline', '.news', '.media'
    ].join(',');

    $(selectors).each((_, element) => {
      try {
        const article = $(element);
        const title = article.find('h1, h2, .headline, .title').first().text().trim();
        const url = article.find('a').first().attr('href');
        const imageUrl = this.getBestImageUrl(article, $);
        
        if (!title || !url) return;

        const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
        
        articles.add(JSON.stringify({ title, url: fullUrl, imageUrl }));
      } catch (err) {
        // Continuar con el siguiente si hay error
      }
    });

    return Array.from(articles).map(JSON.parse);
  }

  async processArticleDetails(article) {
    try {
      const response = await axios.get(article.url, this.axiosConfig);
      const $ = cheerio.load(response.data);
      
      const bodyText = $('.article-body p')
        .filter((_, el) => $(el).text().trim().length > 30)
        .map((_, el) => $(el).text().trim())
        .get()
        .join('\n');
        
      const subtitle = $('.subtitle-atom, .article-subtitle, .entry-subtitle')
        .first()
        .text()
        .trim();

      return {
        ...article,
        content: bodyText || 'No hay contenido disponible',
        description: subtitle || bodyText.split('\n')[0] || 'Sin descripción'
      };
    } catch (err) {
      throw err;
    }
  }

  getBestImageUrl(element, $) {
    console.log('---- Iniciando extracción de imagen ----');

    const imgs = element.find('img');
    for (let i = 0; i < imgs.length; i++) {
      const img = $(imgs[i]);

      const dataSrc = img.attr('data-src');
      const dataSrcSet = img.attr('data-srcset');
      const srcSet = img.attr('srcset');
      const src = img.attr('src');

      if (dataSrcSet) {
        console.log('Imagen encontrada en data-srcset:', dataSrcSet);
        return dataSrcSet.split(',')[0].split(' ')[0];
      }

      if (srcSet) {
        console.log('Imagen encontrada en srcset:', srcSet);
        return srcSet.split(',')[0].split(' ')[0];
      }

      if (dataSrc) {
        console.log('Imagen encontrada en data-src:', dataSrc);
        return dataSrc;
      }

      if (src && !src.includes('data:image')) {
        console.log('Imagen encontrada en src:', src);
        return src;
      }
    }

    const picture = element.find('picture');
    if (picture.length) {
      const sources = picture.find('source');

      for (let i = 0; i < sources.length; i++) {
        const srcset = $(sources[i]).attr('srcset') || $(sources[i]).attr('data-srcset');
        if (srcset) {
          console.log('Imagen encontrada en <picture> source:', srcset);
          return srcset.split(',')[0].split(' ')[0];
        }
      }

      const img = picture.find('img');
      if (img.length) {
        const pictureSrc = $(img[0]).attr('src') || $(img[0]).attr('data-src');
        if (pictureSrc) {
          console.log('Imagen por defecto en <picture>:', pictureSrc);
          return pictureSrc;
        }
      }
    }

    console.log('No se encontró imagen válida');
    return null;
  }

  formatArticles(articles) {
    return articles.map(a => ({
      source: {
        id: 'diario-almeria',
        name: 'Diario de Almería'
      },
      author: 'Diario de Almería',
      title: a.title,
      description: a.description,
      url: a.url,
      urlToImage: a.imageUrl ? (
        a.imageUrl.startsWith('http') ? a.imageUrl :
        a.imageUrl.startsWith('//') ? `https:${a.imageUrl}` :
        `${this.baseUrl}${a.imageUrl}`
      ) : null,
      publishedAt: new Date().toISOString(),
      content: a.content,
      isLocal: true
    }));
  }
}

module.exports = new ScrapingService();

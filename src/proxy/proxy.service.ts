import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ProxyService {
  async fetchAndModify(
    url: string,
  ): Promise<{ data: any; contentType: string }> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const contentType = response.headers['content-type'];

    if (contentType && contentType.includes('text/html')) {
      const $ = cheerio.load(response.data.toString('utf-8'));

      $('body *:not(script)').each((_, element) => {
        $(element)
          .contents()
          .filter((_, node) => node.nodeType === 3) // Node.TEXT_NODE
          .each((_, textNode) => {
            const text = $(textNode).text();
            const modifiedText = text.replace(/\b(\w{6})\b/g, '$1™');
            $(textNode).replaceWith(modifiedText);
          });
      });

      $('[href], [src]').each((_, element) => {
        const href = $(element).attr('href');
        const src = $(element).attr('src');
        if (href && href.includes('https://docs.nestjs.com/')) {
          $(element).attr(
            'href',
            href.replace('https://docs.nestjs.com/', '/'),
          );
        }
        if (src && src.includes('https://docs.nestjs.com/')) {
          $(element).attr('src', src.replace('https://docs.nestjs.com/', '/'));
        }
      });

      const scriptContent = `
          <script>
            function updateLinks() {
              document.querySelectorAll('a[href], link[href], script[src], img[src]').forEach(function(element) {
                if (element.hasAttribute('href')) {
                  var href = element.getAttribute('href');
                  if (href.includes('https://docs.nestjs.com/')) {
                    element.setAttribute('href', href.replace('https://docs.nestjs.com/', '/'));
                  }
                }
                if (element.hasAttribute('src')) {
                  var src = element.getAttribute('src');
                  if (src.includes('https://docs.nestjs.com/')) {
                    element.setAttribute('src', src.replace('https://docs.nestjs.com/', '/'));
                  }
                }
              });
            }

            function updateTextNodes() {
            const regex = /\\b(\\w{6})\\b/g
              document.querySelectorAll('body *:not(script)').forEach(function(element) {
                element.childNodes.forEach(function(node) {
                  if (node.nodeType === Node.TEXT_NODE) {
                    node.nodeValue = node.nodeValue.replace(regex, '$1™');
                  }
                });
              });
            }

            function observeMutations() {
              const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                  if (mutation.type === 'childList' || mutation.type === 'subtree') {
                    updateTextNodes();
                    updateLinks();
                  }
                });
              });

              observer.observe(document.body, {
                childList: true,
                subtree: true
              });
            }

            window.addEventListener('load', function() {
              updateTextNodes();
              updateLinks();
              observeMutations();
            });

          </script>
        `;

      $('body').append(scriptContent);

      return { data: $.html(), contentType };
    } else {
      return { data: response.data, contentType };
    }
  }
}

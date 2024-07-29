import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { proxyUrl } from './proxy.config';

const regex =
  /(?<![A-Za-zА-Яа-яЁёЇїІіЄєҐґ])([A-Za-zА-Яа-яЁёЇїІіЄєҐґ]{6})(?!™)(?![A-Za-zА-Яа-яЁёЇїІіЄєҐґ])|\b([\p{L}]{6})(?!™)\b/gu;

@Injectable()
export class ProxyService {
  async fetchAndModify(
    url: string
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
            const modifiedText = text.replace(regex, '$1™');
            $(textNode).replaceWith(modifiedText);
          });
      });

      $('[href], [src]').each((_, element) => {
        const href = $(element).attr('href');
        const src = $(element).attr('src');
        if (href && href.includes(proxyUrl)) {
          $(element).attr('href', href.replace(proxyUrl, '/'));
        }
        if (src && src.includes(proxyUrl)) {
          $(element).attr('src', src.replace(proxyUrl, '/'));
        }
      });

      const scriptContent = `
          <script>
            function updateLinks() {
              document.querySelectorAll('a[href], link[href], script[src], img[src]').forEach(function(element) {
                if (element.hasAttribute('href')) {
                  var href = element.getAttribute('href');
                  if (href.includes('${proxyUrl}')) {
                    element.setAttribute('href', href.replace('${proxyUrl}', '/'));
                  }
                }
                if (element.hasAttribute('src')) {
                  var src = element.getAttribute('src');
                  if (src.includes('${proxyUrl}')) {
                    element.setAttribute('src', src.replace('${proxyUrl}', '/'));
                  }
                }
              });
            }

            function updateTextNodes() {
              const regex = /(?<![A-Za-zА-Яа-яЁёЇїІіЄєҐґ])([A-Za-zА-Яа-яЁёЇїІіЄєҐґ]{6})(?!™)(?![A-Za-zА-Яа-яЁёЇїІіЄєҐґ])|\\b([\\p{L}]{6})(?!™)\\b/gu
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

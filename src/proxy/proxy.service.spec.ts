import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from './proxy.service';
import axios from 'axios';
import * as cheerio from 'cheerio';

jest.mock('axios');

describe('ProxyService', () => {
  let service: ProxyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProxyService],
    }).compile();

    service = module.get<ProxyService>(ProxyService);
  });

  it('should fetch and modify content', async () => {
    const html =
      '<html><body><p>sample text longer</p><a href="https://docs.nestjs.com/">link</a></body></html>';

    (axios.get as jest.Mock).mockResolvedValue({
      data: html,
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'text/html; charset=utf-8' },
      config: {},
      request: {},
    });

    const modifiedContent = await service.fetchAndModify(
      'https://docs.nestjs.com/',
    );

    const $ = cheerio.load(modifiedContent.data);

    expect($('p').text()).toContain('sample™ text longer™');
    expect($('a').attr('href')).toBe('/');
  });

  it('should handle invalid URLs gracefully', async () => {
    const invalidUrl = 'https://invalid-url.com';
    (axios.get as jest.Mock).mockRejectedValue(new Error('Invalid URL'));

    try {
      await service.fetchAndModify(invalidUrl);
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.message).toBe('Invalid URL');
    }
  });

  it('should return empty content for non-existent URLs', async () => {
    const nonExistentUrl = 'https://nonexistent-url.com';
    (axios.get as jest.Mock).mockResolvedValue({
      data: '',
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
      request: {},
    });

    const modifiedContent = await service.fetchAndModify(nonExistentUrl);
    expect(modifiedContent.data).toBe('');
  });

  it('should handle 500 server errors gracefully', async () => {
    const serverErrorUrl = 'https://server-error-url.com';
    (axios.get as jest.Mock).mockRejectedValue(new Error('Server Error'));

    try {
      await service.fetchAndModify(serverErrorUrl);
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.message).toBe('Server Error');
    }
  });

  it('should handle 503 service unavailable errors gracefully', async () => {
    const serviceUnavailableUrl = 'https://service-unavailable-url.com';
    (axios.get as jest.Mock).mockResolvedValue({
      data: '',
      status: 503,
      statusText: 'Service Unavailable',
      headers: {},
      config: {},
      request: {},
    });

    const modifiedContent = await service.fetchAndModify(serviceUnavailableUrl);
    expect(modifiedContent.data).toBe('');
  });
});

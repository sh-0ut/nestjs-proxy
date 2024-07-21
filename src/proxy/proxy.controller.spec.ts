import { Test, TestingModule } from '@nestjs/testing';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { Response } from 'express';
import { Request } from 'express';

describe('ProxyController', () => {
  let controller: ProxyController;
  let service: ProxyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProxyController],
      providers: [
        {
          provide: ProxyService,
          useValue: {
            fetchAndModify: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProxyController>(ProxyController);
    service = module.get<ProxyService>(ProxyService);
  });

  it('should fetch and return modified content', async () => {
    const mockContent = {
      data: '<html><body>Modified Content</body></html>',
      contentType: 'text/html',
    };

    jest.spyOn(service, 'fetchAndModify').mockResolvedValue(mockContent);

    const req = {
      params: ['websockets/gateways'],
    } as unknown as Request;

    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await controller.proxy(req, ['websockets/gateways'], res);

    expect(service.fetchAndModify).toHaveBeenCalledWith(
      'https://docs.nestjs.com/websockets/gateways',
    );
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
    expect(res.send).toHaveBeenCalledWith(
      '<html><body>Modified Content</body></html>',
    );
  });

  it('should handle errors', async () => {
    jest
      .spyOn(service, 'fetchAndModify')
      .mockRejectedValue(new Error('Test error'));

    const req = {
      params: ['websockets/gateways'],
    } as unknown as Request;

    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await controller.proxy(req, ['websockets/gateways'], res);

    expect(service.fetchAndModify).toHaveBeenCalledWith(
      'https://docs.nestjs.com/websockets/gateways',
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      'Error fetching and modifying content',
    );
  });
});

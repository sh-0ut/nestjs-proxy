import { Controller, Get, Param, Res, Req } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Response, Request } from 'express';
import { proxyUrl } from './proxy.config';

@Controller('')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('*')
  async proxy(@Req() req: Request, @Param() params, @Res() res: Response) {
    const url = `${proxyUrl}${params[0]}`;
    try {
      const { data, contentType } = await this.proxyService.fetchAndModify(url);

      res.setHeader('Content-Type', contentType);
      res.send(data);
    } catch (error) {
      res.status(500).send('Error fetching and modifying content');
    }
  }
}

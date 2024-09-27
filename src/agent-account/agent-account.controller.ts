import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { AgentAccountService } from './agent-account.service';

@Controller('agent-account')
export class AgentAccountController {
  constructor(private readonly agentAccountService: AgentAccountService) {}

  @Get('/duplicate/:data')
  async researchDuplicate(@Param('data') data: string) {
    try {
      return await this.agentAccountService.researchDuplicate(data);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}

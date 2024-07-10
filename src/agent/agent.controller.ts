import {
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentDTO } from 'src/dto/agent.dto';
import { ConvertToOriginalTypePipe } from 'src/pipes/convertToOriginalType.pipe';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}
  @Post()
  @HttpCode(201)
  async create(@Body() agentDto: AgentDTO) {
    try {
      return await this.agentService.create(agentDto);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Patch()
  @UsePipes(ConvertToOriginalTypePipe)
  async update(@Body() agentDto: AgentDTO) {
    try {
      return await this.agentService.update('id', agentDto);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}

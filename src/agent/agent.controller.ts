import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentDTO } from 'src/dto/agent.dto';
import { ConvertToOriginalTypePipe } from 'src/pipes/convertToOriginalType.pipe';
import { UpdateAgentDTO } from 'src/dto/updateAgent.dto';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}
  @Post()
  @HttpCode(201)
  @UsePipes(ConvertToOriginalTypePipe)
  async create(@Body() agentDto: AgentDTO) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...createdAgent } = agentDto;
      return await this.agentService.create(createdAgent as AgentDTO);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.agentService.findAll();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.agentService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get('/duplicate/:data')
  async researchDuplicate(@Param('data') data: string) {
    try {
      return await this.agentService.researchDuplicate(data);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Patch()
  @UsePipes(ConvertToOriginalTypePipe)
  async update(@Body() updateAgentDto: UpdateAgentDTO) {
    const { _id } = updateAgentDto;
    try {
      return await this.agentService.update(_id, updateAgentDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
}

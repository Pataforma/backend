import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

@Controller('users')
export class UsersController {

    constructor(private readonly userService: UsersService){}

    @Post()
    async create(@Body() createUserDto: CreateUserDto){
        return await this.userService.criarUser(createUserDto);
    }

    @Get()
    async getAll(@Query('tipo') tipo?: string) {
        return await this.userService.listarUsuarios(tipo);
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        return await this.userService.getUserById(id);
    }

    @Get('email/:email')
    async getByEmail(@Param('email') email: string) {
        return await this.userService.getUserByEmail(email);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return await this.userService.alterarUser(id, updateUserDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.userService.deletarUsuario(id);
    }
}

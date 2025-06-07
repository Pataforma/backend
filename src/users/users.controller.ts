import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService){}


    @Post()
    async criar(@Body() userDto: CreateUserDto){
        return await this.usersService.criarUser(userDto);
    }

    @Get()
    async listar(){
        return await this.usersService.listarUsuarios();
    }

    @Put(':id')
    async alterar(@Param() id: string, @Body() updateUserDto: UpdateUserDto){
        return await this.usersService.alterarUser(id, updateUserDto);
    }

    @Delete(':id')
    async deletar(@Param() id: string){
        return await this.usersService.deletarUsuario(id);
    }
}

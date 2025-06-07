import { BadGatewayException, ConflictException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { Database } from 'supabase-types';

@Injectable()
export class UsersService {

    private supabase: SupabaseClient<Database>;

    constructor(private prisma: PrismaService){
        this.supabase = createClient<Database>(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
    }

    private async userExistente(id: string){
        const user = await this.prisma.user.findUnique({
            where: {id}
        });

        if(!user){
            throw new NotFoundException('Usuário não encontrado');
        }

        return user;
    }
    private async verificarEmailEmUso(email: string): Promise<Boolean> {
        const emailExiste = await this.prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if(emailExiste){
            throw new ConflictException('Já existe uma conta vinculada à esse email');
        }

        return false;
    }

    async criarUser(userDto: CreateUserDto): Promise<any> {

        await this.verificarEmailEmUso(userDto.email)

        const {data, error} = await this.supabase.auth.admin.createUser({
            email: userDto.email,
            password: userDto.senha,
            email_confirm: true
        });

        if(error){
            throw new BadGatewayException('Erro ao criar o usuário!')
        }

        await this.prisma.user.create({
            data: {
                id: data.user.id,
                email: userDto.email,
                tipo: userDto.tipo,
                nome: userDto.nome
            }
        });

        return { message: 'Usuário criado com sucesso!', novoUsuario: data.user}
    }

    async alterarUser(id: string ,updateUserDto: UpdateUserDto){
        try {
            const user = await this.userExistente(id);

            const usuarioAtualizado = await this.prisma.user.update({
                where: {id},
                data: {
                    nome: updateUserDto.nome ?? user.nome,
                    tipo: updateUserDto.tipo ?? user.tipo
                }
            });

            return {message: 'Usuário atualizado com sucesso', usuarioAtualizado}
        } catch (error) {

            if(error instanceof HttpException){
                return error;
            }

            throw new InternalServerErrorException('Erro ao atualizar o usuário');
        }  
    }

    async listarUsuarios(){
        try {
            const users = await this.prisma.user.findMany({
                where: {
                    tipo: 'veterinário'
                },
                
            });

            return {message: 'Usuários listados com sucesso', users}
        } catch (error) {
            if(error instanceof HttpException){
                return error;
            }
            throw new InternalServerErrorException('Erro ao listar os usuários');
        }
    }

    async deletarUsuario(id: string){
        try {
            const user = await this.userExistente(id);
            await this.supabase.auth.admin.deleteUser(user.id);
            await this.prisma.user.delete({
                where: {id}
            });
            return {message: 'Usuário deletado com sucesso', user}
        } catch (error) {
            if(error instanceof HttpException){
                return error;
            }
            throw new InternalServerErrorException('Erro ao deletar o usuário');
        }
    }
}

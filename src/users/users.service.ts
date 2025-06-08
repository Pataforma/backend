import { BadGatewayException, ConflictException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { Database } from 'supabase-types';
import { getSupabaseAdmin, supabase } from '../utils/supabase';
import 'dotenv/config';

@Injectable()
export class UsersService {

    private supabaseAdmin: SupabaseClient<Database>;

    constructor(private prisma: PrismaService){
        // Usamos a função getSupabaseAdmin para obter o cliente com permissões administrativas
        this.supabaseAdmin = getSupabaseAdmin();
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
        try {
            await this.verificarEmailEmUso(userDto.email);

            // Criamos o usuário usando a API de admin do Supabase
            const {data, error} = await this.supabaseAdmin.auth.admin.createUser({
                email: userDto.email,
                password: userDto.senha,
                email_confirm: true
            });

            if(error){
                throw new BadGatewayException('Erro ao criar o usuário: ' + error.message);
            }

            // Salvamos os dados do usuário no banco usando o Prisma
            await this.prisma.user.create({
                data: {
                    id: data.user.id,
                    email: userDto.email,
                    tipo: userDto.tipo,
                    nome: userDto.nome
                }
            });

            return { message: 'Usuário criado com sucesso!', novoUsuario: data.user};
        } catch (error) {
            if(error instanceof HttpException){
                throw error;
            }
            throw new InternalServerErrorException('Erro ao criar o usuário: ' + error.message);
        }
    }

    async alterarUser(id: string, updateUserDto: UpdateUserDto){
        try {
            const user = await this.userExistente(id);

            const usuarioAtualizado = await this.prisma.user.update({
                where: {id},
                data: {
                    nome: updateUserDto.nome ?? user.nome,
                    tipo: updateUserDto.tipo ?? user.tipo
                }
            });

            return {message: 'Usuário atualizado com sucesso', usuarioAtualizado};
        } catch (error) {
            if(error instanceof HttpException){
                throw error;
            }
            throw new InternalServerErrorException('Erro ao atualizar o usuário: ' + error.message);
        }  
    }

    async listarUsuarios(tipo?: string){
        try {
            const where = tipo ? { tipo } : {};
            
            const users = await this.prisma.user.findMany({
                where,
                orderBy: {
                    criado_em: 'desc'
                }
            });

            return {message: 'Usuários listados com sucesso', users};
        } catch (error) {
            if(error instanceof HttpException){
                throw error;
            }
            throw new InternalServerErrorException('Erro ao listar os usuários: ' + error.message);
        }
    }

    async deletarUsuario(id: string){
        try {
            const user = await this.userExistente(id);
            
            // Deletamos o usuário no Supabase
            const { error } = await this.supabaseAdmin.auth.admin.deleteUser(user.id);
            
            if (error) {
                throw new BadGatewayException('Erro ao deletar usuário no Supabase: ' + error.message);
            }
            
            // Deletamos o usuário no banco de dados
            await this.prisma.user.delete({
                where: {id}
            });
            
            return {message: 'Usuário deletado com sucesso', user};
        } catch (error) {
            if(error instanceof HttpException){
                throw error;
            }
            throw new InternalServerErrorException('Erro ao deletar o usuário: ' + error.message);
        }
    }
    
    // Métodos adicionais para integração com o frontend
    
    async getUserByEmail(email: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email }
            });
            
            if (!user) {
                throw new NotFoundException('Usuário não encontrado');
            }
            
            return user;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException('Erro ao buscar usuário: ' + error.message);
        }
    }
    
    async getUserById(id: string) {
        try {
            return await this.userExistente(id);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException('Erro ao buscar usuário: ' + error.message);
        }
    }
}

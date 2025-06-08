import { Injectable, UnauthorizedException } from '@nestjs/common';
import { supabase } from '../utils/supabase';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    // Obtém as informações do usuário do banco de dados
    const user = await this.prisma.user.findUnique({
      where: { id: data.user.id },
    });

    if (!user) {
      // Se o usuário existe no Supabase mas não no banco, criamos um registro básico
      await this.prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email!,
          tipo: 'pendente',
        },
      });
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  async googleLogin(idToken: string) {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    // Verifica se o usuário já existe no banco
    const user = await this.prisma.user.findUnique({
      where: { id: data.user.id },
    });

    // Se não existir, cria um novo registro
    if (!user) {
      await this.prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email!,
          tipo: 'pendente',
        },
      });
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  async getUserFromToken(token: string) {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return data.user;
  }

  async logout(token: string) {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return { message: 'Logout realizado com sucesso' };
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return { message: 'Link de redefinição de senha enviado' };
  }
} 
import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    private readonly isProduction: boolean;

    constructor() {
        // Verifica o ambiente
        const nodeEnv = process.env.NODE_ENV || 'development';
        const isProduction = nodeEnv === 'production';
        
        // Configuração do Prisma com fallback para URL de teste
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL || 
                         process.env.SUPABASE_POSTGRES_URL || 
                         'postgresql://postgres:postgres@localhost:5432/postgres',
                },
            },
            // Em produção, registra apenas erros; em dev/test, registra tudo
            log: isProduction 
                ? ['error', 'warn'] 
                : ['error', 'warn', 'info', 'query'],
        });
        
        // Depois do super(), podemos usar this
        this.isProduction = isProduction;
        this.logger.log(`Ambiente: ${nodeEnv}`);
    }

    // Para quando o módulo for inicializado, ele rodar essa função automaticamente.
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Conectado ao banco de dados com sucesso');
        } catch (error) {
            this.logger.error(`Erro ao conectar ao banco de dados: ${error.message}`);
            
            if (this.isProduction) {
                // Em produção, falhar se não conseguir conectar
                throw error;
            } else {
                // Em desenvolvimento/teste, continua com funcionalidades limitadas
                this.logger.warn('Continuando com funcionalidades limitadas (modo de teste)');
            }
        }
    }

    // Para quando o módulo for destruido, ele parar essa função automaticamente.
    async onModuleDestroy() {
        await this.$disconnect();
    }
}

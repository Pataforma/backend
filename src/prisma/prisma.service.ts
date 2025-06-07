import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy{

    // Para quando o módulo for inicializado, ele rodar essa função automaticamente.
    async onModuleInit() {
        this.$connect
    }

    // Para quando o módulo for destruido, ele parar essa função automaticamente.
    async onModuleDestroy() {
        this.$disconnect
    }
}

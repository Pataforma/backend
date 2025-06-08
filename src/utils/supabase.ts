import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../supabase-types';
import { Logger } from '@nestjs/common';

const logger = new Logger('SupabaseClient');

// Determina se estamos em produção
const isProduction = process.env.NODE_ENV === 'production';

// Em produção, exige as variáveis de ambiente; em desenvolvimento, usa valores padrão
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verifica se as credenciais estão disponíveis em produção
if (isProduction && (!supabaseUrl || !supabaseAnonKey)) {
  logger.error('Credenciais do Supabase não configuradas em ambiente de produção');
  throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios em produção');
}

// Em desenvolvimento, usa valores de fallback se não estiverem definidos
const devSupabaseUrl = 'https://exemplo.supabase.co';
const devSupabaseKey = 'chave-anonima-exemplo';

// Valores que serão usados (reais em produção, fallback em desenvolvimento)
const finalSupabaseUrl = supabaseUrl || devSupabaseUrl;
const finalSupabaseKey = supabaseAnonKey || devSupabaseKey;

logger.log(`Ambiente: ${isProduction ? 'produção' : 'desenvolvimento'}`);
logger.log(`Usando Supabase URL: ${finalSupabaseUrl.substring(0, 20)}...`);

// Exporta o cliente Supabase
export const supabase = createClient<Database>(finalSupabaseUrl, finalSupabaseKey);

// Exporta o cliente admin (usado para operações que exigem privilégios elevados)
export const getSupabaseAdmin = () => {
  if (!supabaseServiceKey && isProduction) {
    logger.error('SUPABASE_SERVICE_ROLE_KEY não configurada em ambiente de produção');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY é obrigatória para operações administrativas');
  }
  
  return createClient<Database>(
    finalSupabaseUrl, 
    supabaseServiceKey || 'chave-servico-exemplo'
  );
}; 
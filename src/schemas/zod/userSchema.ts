import { z } from 'zod';

const cpfRegex = /^\d{11}$/; // Regex para validar CPF (11 dígitos numéricos)
const passwordRegex = /^.{8,}$/; // Mínimo 8 caracteres 
const telefoneBrRegex = /^\(?\d{2}\)?\s?9\d{4}-?\d{4}$/; // Seguir o padrão brasileiro DDD-9-xxxx-xxxx

// Esquema de Registro
export const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.').max(100),
  email: z.string().email('Formato de e-mail inválido.').max(100),
  cpf: z.string().regex(cpfRegex, 'CPF deve conter exatamente 11 dígitos.').max(11),
  idade: z.number().int().positive('Idade deve ser um número inteiro positivo.'),
  
  // O telefone é opcional, mas se for fornecido, deve seguir o Regex BR
  telefone: z.string()
    .regex(telefoneBrRegex, 'Formato de telefone inválido. Use o padrão BR: (XX) 9XXXX-XXXX.')
    .optional(),
  
  password: z.string().regex(passwordRegex, 'Senha deve ter no mínimo 8 caracteres.'),
});

// Esquema de Login (faltava no seu bloco)
export const loginSchema = z.object({
  identifier: z.string().min(1, 'E-mail ou CPF é obrigatório.'), // Pode ser email ou cpf
  password: z.string().min(1, 'Senha é obrigatória.'),
});

// Esquema de atualização do usuário
export const updateUserSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  email: z.string().email().max(100).optional(),
  cpf: z.string().regex(cpfRegex).max(11).optional(),
  idade: z.number().int().positive().optional(),
  
  // Telefone atualizado com a nova validação BR
  telefone: z.string()
    .regex(telefoneBrRegex, 'Formato de telefone inválido. Use o padrão BR: (XX) 9XXXX-XXXX.')
    .optional(),
});

// Tipos para uso nos Controllers
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>; // Agora funciona!
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
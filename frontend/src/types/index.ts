// --- ENUMS (Espelham o schema.prisma) ---

export type UserRole = 'CLIENTE' | 'ADMIN';

export type Porte = 'PEQUENO' | 'MEDIO' | 'GRANDE';

export type AppointmentStatus = 'AGENDADO' | 'CONCLUIDO' | 'CANCELADO';


// --- MODELOS PRINCIPAIS ---

export interface User {
    id: string;
    nome: string;
    email: string;
    cpf: string;
    idade: number;
    telefone: string | null;
    createdAt: Date;
    updatedAt: Date;
    // O role virá no token e, opcionalmente, no retorno de alguns endpoints
    role: UserRole; 
}

export interface Dog {
    id: string;
    nome: string;
    idade: number;
    raca: string; // Validada com dog.ceo
    porte: Porte;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
}

// O modelo Service agora tem os preços por porte (devido à última migração)
export interface Service {
    id: string;
    name: string;
    pricePequeno: number;
    priceMedio: number;
    priceGrande: number;
    createdAt: Date;
    updatedAt: Date;
}

// Modelo base para Agendamento (retorno da API)
export interface Appointment {
    id: string;
    date: string | Date; // String no backend, usaremos Date no frontend
    status: AppointmentStatus;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    
    // Relações incluídas no retorno dos controllers (dogs e services simplificados)
    dogs: Dog[]; 
    services: Service[]; 
    user?: Pick<User, 'id' | 'nome' | 'email' | 'telefone'>; // Opcional, dependendo do include
}


// --- TIPOS DE ENTRADA (Payloads) ---

export interface RegisterPayload {
    nome: string;
    email: string;
    cpf: string;
    idade: number;
    telefone?: string;
    password: string;
}

export interface LoginPayload {
    identifier: string; // email ou cpf
    password: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: Omit<User, 'passwordHash' | 'createdAt' | 'updatedAt' | 'cpf' | 'idade'>;
}

export interface CreateDogPayload {
    nome: string;
    idade: number;
    raca: string;
    porte: Porte;
}
export type UpdateDogPayload = Partial<CreateDogPayload>;;

export interface CreateAppointmentPayload {
    date: string; // Deve ser uma string ISO 8601 (ex: "2025-12-31T10:00:00.000Z")
    dogIds: string[];
    serviceIds: string[];
}


export interface BlockedTimeSlot {
    id: string;
    dateStart: string; // ISO 8601 string do backend
    dateEnd: string;   // ISO 8601 string do backend
    reason: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateBlockedTimeSlotPayload {
    dateStart: string;
    dateEnd: string;
    reason: string;
}
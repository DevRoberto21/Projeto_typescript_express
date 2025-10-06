import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({//Cria uma única instância do PrismaClient para ser usada em toda a aplicação
    log:['query','info','warn','error'],// logs para debugging

});

export default prisma;
    

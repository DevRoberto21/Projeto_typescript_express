import axios from 'axios';

// Variável para cache da lista completa de raças
let cachedBreeds: string[] | null = null;

/**
 * [GET] API dog.ceo - Busca a lista completa de raças (incluindo sub-raças) e armazena em cache.
 * @returns Array de strings de todas as raças e sub-raças formatadas.
 */
export async function fetchAllBreeds(): Promise<string[]> {
    if (cachedBreeds) {
        return cachedBreeds; // Retorna o cache se disponível
    }

    try {
        const response = await axios.get<{ message: { [key: string]: string[] } }>('https://dog.ceo/api/breeds/list/all');
        const breedMap = response.data.message;
        const breeds: string[] = [];
        
        // Itera sobre as raças principais
        for (const primaryBreed in breedMap) {
            // Adiciona a raça principal (Ex: "poodle")
            breeds.push(primaryBreed);
            
            // Adiciona sub-raças (Ex: "miniature poodle")
            const subBreeds = breedMap[primaryBreed];
            if (subBreeds.length > 0) {
                subBreeds.forEach(sub => {
                    // Formata como "sub-breed primary-breed" (Ex: "golden retriever")
                    breeds.push(`${sub} ${primaryBreed}`);
                });
            }
        }

        cachedBreeds = breeds; // Armazena o resultado em cache
        return breeds;
    } catch (error) {
        console.error("Erro ao buscar a lista de raças do Dog CEO API:", error);
        return []; 
    }
}
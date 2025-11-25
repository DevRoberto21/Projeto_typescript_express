import axios from "axios";


/** * @param breedName - O nome da raça do cachorro a ser validada.
* @returns {Promise<boolean>} - Retorna true se a raça for válida, caso contrário false.
*/
export async function validateDogBreed(breedName:string): Promise<boolean>{
    try{
        // Busa a lista de raças de cachorro da API pública Dog CEO
        const response = await axios.get('https://dog.ceo/api/breeds/list/all');
        // Retorna um objeto onde as chaves são os nomes das raças e os valores são arrays de sub-raças
        const breedMap: { [key:string]:string[]} = response.data.message;

        const normalizedSubmittedName = breedName.toLowerCase().trim();
        
        const validBreeds: string[] = [];

        // 1. Itera e achata a lista de raças válidas (principal + sub-raças)
        for (const primaryBreed in breedMap) {
            // Adiciona a raça principal (Ex: "poodle")
            validBreeds.push(primaryBreed); 

            // Adiciona as sub-raças formatadas (Ex: "staffordshire terrier", "golden retriever")
            const subBreeds = breedMap[primaryBreed];
            if (subBreeds.length > 0) {
                subBreeds.forEach(sub => {
                    // O formato deve ser 'sub-raça raça-principal'
                    validBreeds.push(`${sub} ${primaryBreed}`); 
                });
            }
        }
        
        // 2. Verifica se o nome submetido existe na lista completa
        return validBreeds.includes(normalizedSubmittedName);


    } catch (error){
        console.error("Erro ao validar a raça do cachorro:", error);// Em casos de erro, loga o erro no console
        return false;
    }
}
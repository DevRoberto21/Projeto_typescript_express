import axios from "axios";


/** 
* *@param breedName - O nome da raça do cachorro a ser validada.
* @returns {Promise<boolean>} - Retorna true se a raça for válida, caso contrário false.
*/
export async function validateDogBreed(breedName:string): Promise<boolean>{
    try{
        //Busa a lista de raças de cachorro da API pública Dog CEO
        const response = await axios.get('https://dog.ceo/api/breeds/list/all');
        //Retorna um objeto onde as chaves são os nomes das raças e os valores são arrays de sub-raças (se houver)
        const breeds: { [key:string]:string[]} = response.data.message;

        const normalizedBreedName = breedName.toLowerCase().trim();//Padroniza o nome da raça para comparação

        return Object.keys(breeds).includes(normalizedBreedName);// Verifica se o nome da raça existe na lista de raças


    } catch (error){
        console.error("Erro ao validar a raça do cachorro:", error);// Em casos de erro, loga o erro no console
        return false;
    }
}

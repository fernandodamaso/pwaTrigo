import { Base } from "./base";
import { classificacao } from "./classificacao";

export class Tags extends Base{
idLoja:number;
idMarca:number;
classificacoes:classificacao[];
}
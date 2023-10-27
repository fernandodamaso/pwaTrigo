import { Perguntas } from "./perguntas";
import { Tags } from "./tags";
import { Base } from "./base";

export class Respostas extends Base{
    idLoja:number;
    idMarca:number;
    idModelo:number;
    pergunta:Perguntas[];
    tags:Tags[];
    qtdEstrelas:number;
    idCliente: any;
}   
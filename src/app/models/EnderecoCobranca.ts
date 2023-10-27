import { Estado } from "./Estado";
import { Municipio } from "./Municipio";

export class EnderecoCobranca { 
    id_cliente: number;
    id_endereco: number;
    nome: string;
    cep: string;
    logradouro: string;
    complemento: string;
    referencia: string;
    bairro: string;
    numero: string|null;
    municipio: Municipio
    estado: Estado
    latitude: string;
    longitude: string;
    data_inclusao: string;
    data_ultima_alteracao: string;
    id_cartao: number

}
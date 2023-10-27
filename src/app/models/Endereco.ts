import { Municipio } from "./Municipio";
import { Estado } from "./Estado";

export class Endereco{

    id_cliente: number;
    id_marca: number;
    id_endereco: number;
    nome: string;
    cep: string;
    logradouro: string;
    complemento: string;
    referencia: string;
    bairro: string;
    numero: string;
    Municipio: Municipio;
    Estado: Estado;
    latitude: string;
    longitude: string;
    google_place_id: string;
    data_inclusao: string;
    data_ultima_alteracao: string;
    id_cartao: number;
}



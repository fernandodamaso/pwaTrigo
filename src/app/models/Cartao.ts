import { EnderecoCobranca } from "./EnderecoCobranca";
import {GatewaysPgtCartao} from "./GatewaysPgtCartao"

export class Cartao{
    id_cliente: number;
    id_cartao: number;
    numero: string;
    vigencia: string;
    cvv: string;
    nome_portador: string;
    cpf_portador: string;
    ult_4_digitos: string;
    bin: string;
    data_inclusao: string;
    id_bandeira_gcom: number;
    nm_bandeira: string;
    token_cartao_mercado_livre: string;
    gateways_pgt_cartao:GatewaysPgtCartao[];
    endereco_cobranca: EnderecoCobranca;
    id_forma_pagamento: number;
    basicAuthUserName: string;
    id_etb_gcom: number;

}



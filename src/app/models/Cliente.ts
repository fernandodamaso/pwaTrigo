import {Telefone} from "./Telefone"
import { Endereco } from "./Endereco";
import { Cartao } from "./Cartao";
import { GatewaysPgtCliente } from "./GatewaysPgtCliente";
import { Indicators } from "./Indicators";
import {IEntity } from "./IEntity"
import { AccessInfo } from "./AccessInfo";


export class Cliente extends IEntity { 
    AccessInfo?:AccessInfo
    Id?: number;
    idOracle?: number;
    id_cliente?: number;
    id_seq?: number;
    id_marca?: number;
    id_shopping?: number;
    nome_completo?: string;
    cpf_cnpj?: string;
    senha?: string;
    senha_antiga?: string;
    data_nascimento?: string;
    sexo?: string;
    email1?: string;
    email2?: string;
    email3?: string;
    data_confirmacao?:string;
    data_inclusao?: string;
    data_ultima_alteracao?: string;
    data_ultimo_acesso?: string;
    cliente_importado?: boolean;
    facebook_id?: string;
    facebook?: boolean;
    googleLogin?: boolean;
    google_id?: string;
    telefones?: Telefone[]
    enderecos?: Endereco[]
    cartoes?: Cartao[]
    Operacao?: string;
    gateways_pgt_cliente?: GatewaysPgtCliente[];
    DT_INCLUSAO?: Date;
    Cd_rec_snh?: string;
    Dt_rec_snh?: string;
    aceitaTermosFidelidade?: boolean;
    aceitaTermos?: boolean;
    aceitaPoliticaPrivacidade?: boolean;
    Indicadores?: Indicators[];
    ic_aceita_sms?: string;
    ic_aceita_email?: string;
    codigo_convite?: string;
    table_name?: string = "CLIENTE";

}

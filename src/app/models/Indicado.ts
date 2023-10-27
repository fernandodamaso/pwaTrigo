import { Convite } from "./Convite";
import { MGMConfiguracao } from "./MGMConfiguracao";
export class Indicado {
  id: number;
  convite: Convite;
  nome: string;
  id_cliente: number;
  id_cliente_oracle: number;
  beneficio_ativo: boolean | null;
  configuracao: MGMConfiguracao;
  valor_obtido_cashback: number;
  data_cadastro_indicado: string;
  valor_indicador?: any;
  data_beneficio_ativo_indicado: string;
}

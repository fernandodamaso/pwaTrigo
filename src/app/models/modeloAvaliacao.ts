import { Base } from "./base";
import { Experiencia } from "./experiencia";
import { TipoRetirada } from "./tipoRetirada";
import { Perguntas } from "./perguntas";
import { configuracaoTags } from "./configuracaotags";
export class modeloAvaliacao extends Base {
  idLoja: number;
  idMarca: number;
  estrelas: number;
  permiteResposta: boolean;
  autorizado: boolean;
  permiteObservacao: boolean;
  experiencia: Experiencia[];
  OrigemPedido: number;
  tipoRetirada: TipoRetirada[];
  perguntas: Perguntas[];
  configuracaoTags: configuracaoTags[];
}
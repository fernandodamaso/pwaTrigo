import { Base } from "./base";
import { novoModeloResposta } from "./novoModeloResposta";
export class Avaliacao extends Base {
  idLoja: number;
  idMarca: number;
  idModelo: number;
  idPedido: number;
  tipoRetirada: String;
  idVendaDireta: number;
  idCliente: number;
  Telefone: string;
  Email: string;
  OrigemPedido: number;
  observacao: String;
  AceitaResposta: boolean;
  respostas: novoModeloResposta;
  NovaMensagem: boolean;
}
import { Base } from "./base";
import { Tags } from "./tags";
import { classificacao } from "./classificacao";
import { Experiencia } from "./experiencia";
import { configuracaoTags } from "./configuracaotags";

export class Perguntas extends Base {
  Nome: string;
  ID: number;
  estrelasMax: number;
  estrelasMin: number;
  perguntaPai: number;
  quantidadeMaxResposta: number;
  idLoja: number;
  idMarca: number;
  NPS : Boolean;
  tags: Tags[];
  qtdEstrelas:number;
  classificacao: classificacao[];
  experiencias: Experiencia[];
  configuracaotags: configuracaoTags[];
}

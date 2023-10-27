import { Base } from "./base";

export class novoModeloResposta extends Base {
  Nome: string;
  Descricao: string;
  DataCriacao: Date;
  DateAlteracao: Date;
  UsuarioCriacao: number;
  UsuarioEdicao: number;
  Ativo: boolean;
  Status: number;
  idLoja: number;
  idMarca: number;
  idModelo: number;
  idPedido: number | string;
  PedidoAvaliado: number;
  idVendaDireta: number;
  idCliente: number;
  idClienteOracle: number;
  Telefone: string;
  Email: string;
  OrigemPedido: number;
  tipoRetirada: string;
  observacao: string;
  AceitaResposta: boolean;
  respostas: novoRespostas;
  DtVenda: String;
  lojaNome: string;
}

export class novoClassificaco {
  Nome: string;
  Descricao: string;
  DataCriacao: Date;
  DateAlteracao: Date;
  UsuarioCriacao: number;
  UsuarioEdicao: number;
  Ativo: boolean;
  Status: number;
  table_name: string;
  entity_filters: novoEntityFilter2[];
  idLoja: number;
  idMarca: number;
}

export class novoTag2 {
  Nome: string;
  Descricao: string;
  DataCriacao: Date;
  DateAlteracao: Date;
  UsuarioCriacao: number;
  UsuarioEdicao: number;
  Ativo: boolean;
  Status: number;
  table_name: string;
  entity_filters: novoEntityFilter[];
  idLoja: number;
  idMarca: number;
  classificacoes: novoClassificaco[];
}

export class novoTag {
  Descricao: string;
  tags: novoTag2[];
}

export class novoPergunta {
  Nome: string;
  Estrela: number;
  tags: novoTag[];
}

export class novoRespostas {
  DataCriacao: Date;
  DateAlteracao: Date;
  UsuarioCriacao: number;
  UsuarioEdicao: number;
  Ativo: boolean;
  Status: number;
  idLoja: number;
  idMarca: number;
  idModelo: number;
  QuantidadeNPS: number;
  perguntas: novoPergunta[];
}

export class novoEntityFilter {
  Column: string;
  Value: string;
}

export class novoEntityFilter2 {
  Column: string;
  Value: string;
}
import { Base } from "./base";

export class StoryOrder extends Base {
    Id: number;
    Id_Cliente: number;
    Id_ClienteOracle: number;
    Id_ClienteCosmos: number;
    Id_Marca: number;
    Id_Loja: number;
    Id_VendaDireta: number;
    Id_Origem: number;
    Id_RefLoja: string;
    PedidoAvaliado: boolean;
    id_integracao: string;
    DtVenda: string;
  }
  
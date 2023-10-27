import {Base} from './base';

export class Mensagem extends Base{
    tokenAdm : string;
    tokenUsuario : string;
    mensagem : string;
    numero : number;
    auto : boolean;
}
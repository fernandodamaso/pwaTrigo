import {Base} from './base';
import {Anexo} from './Anexo';
import {Mensagem} from './Mensagem';

export class Chat extends Base{
    Mensagem : Mensagem;
    TokenAdm : string;
    TokenUsuario : string;
    idAvaliacao : number;
    Anexo : Anexo[];
}
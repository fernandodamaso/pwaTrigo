import { Base } from "./base";
import { Tags } from "./tags";

export class configuracaoTags extends Base {
    EstrelaMax:number;
    EstrelaMin:number;
    tags: Tags[];
    descricaoTags: string;
}
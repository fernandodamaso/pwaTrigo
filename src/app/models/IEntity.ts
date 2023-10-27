import { QueryFilter } from "./QueryFilter";

export class IEntity{
    entity_filters?: QueryFilter[];
    table_name?: string;
}
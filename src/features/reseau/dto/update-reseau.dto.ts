import { PartialType } from '@nestjs/mapped-types';
import { CreateReseauDto } from './create-reseau.dto';

export class UpdateReseauDto extends PartialType(CreateReseauDto) {}

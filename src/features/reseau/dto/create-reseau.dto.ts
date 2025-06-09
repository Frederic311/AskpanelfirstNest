import { IsNotEmpty, IsString } from "class-validator";

export class CreateReseauDto {
@IsString()
@IsNotEmpty()
nom: string;
}

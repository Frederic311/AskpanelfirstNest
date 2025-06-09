import { IsNotEmpty, IsString } from "class-validator";

export class CreateAgenceDto {
@IsString()
@IsNotEmpty()
nom: string;
}

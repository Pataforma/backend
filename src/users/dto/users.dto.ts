import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";


export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    nome: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0
    })
    @IsNotEmpty()
    senha: string


    @IsString()
    @IsNotEmpty()
    tipo: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto){}
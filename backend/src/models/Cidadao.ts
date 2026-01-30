import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../config/database';
import { encrypt, decrypt } from '../utils/encryption';

export interface CidadaoAttributes {
    id?: string;
    cpf: string;
    nome_completo: string;
    data_nascimento: Date;
    telefone: string;
    email: string;
    senha?: string;
    municipio: string;
    estado: string;
    cep?: string;
    rua?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    ip_consentimento?: string;
    reset_password_token?: string | null;
    reset_password_expires?: Date | null;
    foto_perfil?: string | null;
}

export class Cidadao extends Model<CidadaoAttributes> implements CidadaoAttributes {
    public id!: string;
    public cpf!: string;
    public nome_completo!: string;
    public data_nascimento!: Date;
    public telefone!: string;
    public email!: string;
    public senha?: string;
    public municipio!: string;
    public estado!: string;
    public cep?: string;
    public rua?: string;
    public numero?: string;
    public complemento?: string;
    public bairro?: string;
    public campos_customizados?: Record<string, any>;
    public consentimento_lgpd!: boolean;
    public data_consentimento?: Date;
    public ip_consentimento?: string;
    public reset_password_token?: string | null;
    public reset_password_expires?: Date | null;
    public foto_perfil?: string | null;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Método para obter CPF descriptografado
    public getCPFDecrypted(): string {
        return decrypt(this.cpf);
    }

    // Método para definir CPF criptografado
    public setCPFEncrypted(cpf: string): void {
        this.cpf = encrypt(cpf);
    }
}

Cidadao.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: UUIDV4,
            primaryKey: true,
        },
        cpf: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        nome_completo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        data_nascimento: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        telefone: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        senha: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        municipio: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        estado: {
            type: DataTypes.STRING(2),
            allowNull: false,
        },
        cep: {
            type: DataTypes.STRING(9),
            allowNull: true,
        },
        rua: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        numero: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        complemento: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        bairro: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        // @ts-ignore
        campos_customizados: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
        },
        consentimento_lgpd: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        data_consentimento: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        ip_consentimento: {
            type: DataTypes.STRING(45), // IPv6
            allowNull: true,
        },
        reset_password_token: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        reset_password_expires: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        foto_perfil: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'cidadaos',
        timestamps: true,
        underscored: true,
    }
);

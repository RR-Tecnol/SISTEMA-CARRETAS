import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../config/database';

export interface CaminhaoAttributes {
    id: string;
    placa: string;
    modelo: string;
    ano: number;
    capacidade_atendimento: number;
    custo_diario: number;
    status: 'disponivel' | 'em_manutencao' | 'em_acao';
}

export class Caminhao extends Model<CaminhaoAttributes> implements CaminhaoAttributes {
    public id!: string;
    public placa!: string;
    public modelo!: string;
    public ano!: number;
    public capacidade_atendimento!: number;
    public custo_diario!: number;
    public status!: 'disponivel' | 'em_manutencao' | 'em_acao';

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Caminhao.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: UUIDV4,
            primaryKey: true,
        },
        placa: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true,
        },
        modelo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ano: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        capacidade_atendimento: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        custo_diario: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        status: {
            type: DataTypes.ENUM('disponivel', 'em_manutencao', 'em_acao'),
            allowNull: false,
            defaultValue: 'disponivel',
        },
    },
    {
        sequelize,
        tableName: 'caminhoes',
        timestamps: true,
        underscored: true,
    }
);

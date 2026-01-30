import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../config/database';

export type AcaoTipo = 'curso' | 'saude';
export type AcaoStatus = 'planejada' | 'ativa' | 'concluida';

export interface AcaoAttributes {
    id: string;
    instituicao_id: string;
    tipo: AcaoTipo;
    municipio: string;
    estado: string;
    data_inicio: Date;
    data_fim: Date;
    status: AcaoStatus;
    descricao?: string;
    local_execucao: string;
    vagas_disponiveis: number;
    campos_customizados?: Record<string, any>;
}

export class Acao extends Model<AcaoAttributes> implements AcaoAttributes {
    public id!: string;
    public instituicao_id!: string;
    public tipo!: AcaoTipo;
    public municipio!: string;
    public estado!: string;
    public data_inicio!: Date;
    public data_fim!: Date;
    public status!: AcaoStatus;
    public descricao?: string;
    public local_execucao!: string;
    public vagas_disponiveis!: number;
    public campos_customizados?: Record<string, any>;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Acao.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: UUIDV4,
            primaryKey: true,
        },
        instituicao_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'instituicoes',
                key: 'id',
            },
        },
        tipo: {
            type: DataTypes.ENUM('curso', 'saude'),
            allowNull: false,
        },
        municipio: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        estado: {
            type: DataTypes.STRING(2),
            allowNull: false,
        },
        data_inicio: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        data_fim: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('planejada', 'ativa', 'concluida'),
            allowNull: false,
            defaultValue: 'planejada',
        },
        descricao: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        local_execucao: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        vagas_disponiveis: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        campos_customizados: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
        },
    },
    {
        sequelize,
        tableName: 'acoes',
        timestamps: true,
        underscored: true,
    }
);

import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../config/database';

export type InscricaoStatus = 'inscrito' | 'confirmado' | 'concluido' | 'cancelado';

export interface InscricaoAttributes {
    id?: string;
    cidadao_id: string;
    acao_curso_id: string;
    status: InscricaoStatus;
    data_inscricao: Date;
    compareceu?: boolean;
    nota_final?: number;
    observacoes?: string;
    campos_customizados?: Record<string, any>;
}

export class Inscricao extends Model<InscricaoAttributes> implements InscricaoAttributes {
    public id!: string;
    public cidadao_id!: string;
    public acao_curso_id!: string;
    public status!: InscricaoStatus;
    public data_inscricao!: Date;
    public compareceu?: boolean;
    public nota_final?: number;
    public observacoes?: string;
    public campos_customizados?: Record<string, any>;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Inscricao.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: UUIDV4,
            primaryKey: true,
        },
        cidadao_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'cidadaos',
                key: 'id',
            },
        },
        acao_curso_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'acao_curso_exame',
                key: 'id',
            },
        },
        status: {
            type: DataTypes.ENUM('inscrito', 'confirmado', 'concluido', 'cancelado'),
            allowNull: false,
            defaultValue: 'inscrito',
        },
        data_inscricao: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        compareceu: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        nota_final: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
        observacoes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        campos_customizados: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
        },
    },
    {
        sequelize,
        tableName: 'inscricoes',
        timestamps: true,
        underscored: true,
    }
);

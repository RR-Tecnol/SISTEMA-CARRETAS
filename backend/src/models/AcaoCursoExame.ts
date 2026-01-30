import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../config/database';

export interface AcaoCursoExameAttributes {
    id?: string;
    acao_id: string;
    curso_exame_id: string;
    vagas: number;
    horarios?: Record<string, any>;
    campos_customizados?: Record<string, any>;
}

export class AcaoCursoExame extends Model<AcaoCursoExameAttributes> implements AcaoCursoExameAttributes {
    public id!: string;
    public acao_id!: string;
    public curso_exame_id!: string;
    public vagas!: number;
    public horarios?: Record<string, any>;
    public campos_customizados?: Record<string, any>;
}

AcaoCursoExame.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: UUIDV4,
            primaryKey: true,
        },
        acao_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'acoes',
                key: 'id',
            },
        },
        curso_exame_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'cursos_exames',
                key: 'id',
            },
        },
        vagas: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        horarios: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: [],
        },
        campos_customizados: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
        },
    },
    {
        sequelize,
        tableName: 'acao_curso_exame',
        timestamps: false,
        underscored: true,
    }
);

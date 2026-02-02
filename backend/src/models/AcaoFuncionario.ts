import { Model, DataTypes, UUIDV4, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AcaoFuncionarioAttributes {
    id: string;
    acao_id: string;
    funcionario_id: string;
}

export interface AcaoFuncionarioCreationAttributes extends Optional<AcaoFuncionarioAttributes, 'id'> { }

export class AcaoFuncionario extends Model<AcaoFuncionarioAttributes, AcaoFuncionarioCreationAttributes> implements AcaoFuncionarioAttributes {
    public id!: string;
    public acao_id!: string;
    public funcionario_id!: string;
}

AcaoFuncionario.init(
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
        funcionario_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'funcionarios',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        tableName: 'acao_funcionarios',
        timestamps: true,
        underscored: true,
    }
);

import Model from './Model';

export interface Motorcycle {
  id: number;
  plate_number: string;
  owner_name: string;
  owner_tel: string;
  model: string;
  engine_number: string;
  front_tire_pressure: number;
  rear_tire_pressure: number;
}

class MotorCyclesModel extends Model<Motorcycle> {
  constructor(table = 'motorcycles') {
    super(table);
  }

  async findAll(): Promise<Motorcycle[]> {
    const { data } = await this.select({ order: ['id']});

    return data || [];
  }

  async findById(id: number): Promise<Motorcycle | null> {
    const { data } = await this.select({ conditions: [['id', `${id}`]] });

    if (Array.isArray(data)) {
      const [motorcycle = null] = data;

      return motorcycle;
    }

    return data;
  }

  async updateById(id: number, updateData: Partial<Motorcycle>) {
    const { data, error } = await this.update(updateData, [['id', `${id}`]]);

    if (error) return null;

    return data;
  }
}

export default MotorCyclesModel;

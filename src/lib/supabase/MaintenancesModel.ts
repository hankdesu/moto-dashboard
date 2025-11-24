import Model from './Model';

export interface Maintenance {
  id: number;
  motorcycle_id: number;
  maintenance_date: Date;
  maintenance_items: string;
  mileage: number;
  total_price: number;
  remark: string | null;
}

class MaintenacesModel extends Model<Maintenance> {
  constructor(table = 'maintenances') {
    super(table);
  }

  async findById(id: string) {
    const { data } = await this.select({
      conditions: [['motorcycle_id', `${id}`]],
      order: ['maintenance_date', { ascending: false }]
    });

    return data ?? [];
  }

  async updateById(
    id: number,
    updateData: Partial<Omit<Maintenance, 'maintenance_date' | 'mileage' | 'total_price'>>
  ) {
    const { data, error } = await this.update(updateData, [['id', `${id}`]]);

    if (error) return null;

    return data;
  }

  async deleteByIds(ids: number[]) {
    const { data, error } = await this.delete({ column: 'id', value: ids });

    if (error) return null;

    return data;
  }
}

export default MaintenacesModel;

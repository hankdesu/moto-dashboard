import Model from './Model';

export interface Maintenance {
  id: number;
  motorcycle_id: number;
  maintenance_date: Date;
  maintenance_items: string;
  mileage: number;
  total_price: number;
}

class MaintenacesModel extends Model<Maintenance> {
  constructor(table = 'maintenances') {
    super(table);
  }

  async findById(id: string) {
    const { data } = await this.select({
      conditions: [['motorcycle_id', `${id}`]],
      order: ['id', { ascending: false }]
    });

    return data ?? [];
  }
}

export default MaintenacesModel;

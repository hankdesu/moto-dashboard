import Model from './Model';

interface Maintenance {
  id: number;
  motorcycle_id: number;
  maintenance_date: Date;
  maintenance_items: JSON;
  mileage: number;
  price: number;
}

class MaintenacesModel extends Model<Maintenance> {
  constructor(table = 'maintenances') {
    super(table);
  }

  async findById(id: string) {
    const { data } = await this.select({ conditions: [['motorcycle_id', `${id}`]] });

    return data;
  }
}

export default MaintenacesModel;

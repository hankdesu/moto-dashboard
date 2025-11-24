import { format } from 'date-fns';

import type { PageLoad } from './$types';

import MaintenacesModel, { type Maintenance } from '$lib/supabase/MaintenancesModel';

interface ParsedMaintenance extends Omit<Maintenance, 'maintenance_items' | 'maintenance_date'> {
  maintenance_date: string;
  maintenance_items: { value: ''; price: string; isOther?: boolean }[];
  total_price: number;
}

export const load: PageLoad = async ({ params, depends }) => {
  const { id } = params;
  depends(`maintenances:[${id}]`);
  const maintenacesModel = new MaintenacesModel();
  const maintenances = await maintenacesModel.findById(id);
  const parsedMaintenances: ParsedMaintenance[] = maintenances?.map((maintenance) => {
    let formattedData: ParsedMaintenance = {
      id: maintenance.id,
      motorcycle_id: maintenance.motorcycle_id,
      mileage: maintenance.mileage,
      maintenance_date: format(new Date(maintenance.maintenance_date), 'yyyy-MM-dd'),
      maintenance_items: [],
      total_price: maintenance.total_price,
      remark: maintenance.remark
    };
    try {
      const parsedItems = JSON.parse(maintenance.maintenance_items) || [];
      formattedData = {
        ...formattedData,
        maintenance_items: parsedItems
      };
    } catch (error) {
      console.error(error);
    }
    return formattedData;
  });

  return { id, maintenances: parsedMaintenances || [] };
};

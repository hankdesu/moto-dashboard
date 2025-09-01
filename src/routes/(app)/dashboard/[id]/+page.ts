import { format } from 'date-fns';

import type { PageLoad } from './$types';

import MaintenacesModel from '$lib/supabase/MaintenancesModel';

export const load: PageLoad = async ({ params, depends }) => {
  const { id } = params;
  depends(`maintenances:[${id}]`);
  const maintenacesModel = new MaintenacesModel();
  const maintenances = await maintenacesModel.findById(id);
  const parsedMaintenances = maintenances?.map((maintenance) => {
    const parsedItems = JSON.parse(maintenance.maintenance_items) || [];
    const price = parsedItems.reduce((acc: number, cur: { price: string }) => (acc += Number(cur.price)), 0);
    return {
      ...maintenance,
      maintenance_items: parsedItems,
      maintenance_date: format(maintenance.maintenance_date, 'yyyy-MM-dd'),
      price
    };
  });

  return { id, maintenances: parsedMaintenances || [] };
};

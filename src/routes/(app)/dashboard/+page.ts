import MotorCyclesModel from '$lib/supabase/MotorcyclesModel';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
  depends('motorcycles:list');
  const motorcyclesModel = new MotorCyclesModel();
  const motorcycles = await motorcyclesModel.findAll();

  return { motorcycles };
};

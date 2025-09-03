<script lang="ts">
  import { format } from 'date-fns';

  import { invalidate } from '$app/navigation';
  import LeftChevron from '$lib/icons/LeftChevron.svelte';
  import Plus from '$lib/icons/Plus.svelte';
  import MaintenacesModel from '$lib/supabase/MaintenancesModel';

  const today = new Date();
  const formattedToday = format(today, 'yyyy-MM-dd');
  const initialFormData = {
    maintenance_items: [{ price: null, value: '' }],
    mileage: 0,
    maintenance_date: formattedToday,
    total_price: 0
  };
  let { data } = $props();
  let mode = $state(1);
  let formData = $state({
    maintenance_items: [{ price: null, value: '' }],
    mileage: 0,
    maintenance_date: formattedToday,
    total_price: 0
  });
  let deletedIds = $state<number[]>([]);
  let isAllDeleted = $derived(deletedIds.length === data.maintenances.length);
  let isIndeterminated = $derived(
    deletedIds.length > 0 && deletedIds.length < data.maintenances.length
  );
  let form;
  let modal: HTMLDialogElement;

  function handleAddClick() {
    modal.showModal();
  }

  function toggleDelete() {
    if (mode === -1) {
      deletedIds = [];
      mode = 1;
    } else {
      mode = -1;
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const maintenancesModel = new MaintenacesModel();
    try {
      const insertData = {
        motorcycle_id: data.id,
        maintenance_items: JSON.stringify(formData.maintenance_items),
        mileage: formData.mileage,
        maintenance_date: formattedToday,
        total_price: formData.total_price
      };

      let result;
      if (mode === 1) {
        result = await maintenancesModel.insert(insertData);
      }

      modal.close();
      formData = { ...initialFormData };
      mode = 1;
      await invalidate(`maintenances:[${data.id}]`);
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }

  async function handleDelete(e: Event) {
    e.preventDefault();

    const maintenanceModel = new MaintenacesModel();
    try {
      await maintenanceModel.deleteByIds(deletedIds);

      toggleDelete();

      await invalidate(`maintenances:[${data.id}]`);
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }

  function handleCancel() {
    modal.close();
    formData = { ...initialFormData };
  }

  function isDeleted(id: number) {
    return deletedIds.includes(id);
  }

  function handleChange(id: number) {
    deletedIds = isDeleted(id)
      ? deletedIds.filter((deletedId) => deletedId !== id)
      : [...deletedIds, id];
  }

  function handleChangeAll(e: Event & { currentTarget: HTMLInputElement }) {
    if (e.currentTarget.checked) {
      deletedIds = data.maintenances.map(({ id }) => id);
    } else {
      deletedIds = [];
    }
  }

  function addItem(e: MouseEvent) {
    e.preventDefault();

    const item = { price: null, value: '' };
    formData.maintenance_items.push(item);
  }
</script>

<div class="flex w-full flex-col gap-10 p-10">
  <div class="card bg-neutral">
    <div class="card-body flex flex-row justify-between">
      <h1 class="card-title text-primary">保養紀錄</h1>
      <div class="flex gap-5">
        <button class="btn btn-outline btn-primary" onclick={handleAddClick}>新增資料</button>
        <button class="btn btn-outline btn-error" onclick={toggleDelete}>刪除資料</button>
      </div>
    </div>
  </div>
  <div>
    <button class="btn">
      <LeftChevron className="h-4" />
      <a href="/dashboard">車籍資料</a>
    </button>
  </div>
  <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
    <table class="table">
      <thead>
        <tr>
          {#if mode === -1}
            <th class="w-[40px]">
              <input
                type="checkbox"
                class="checkbox checkbox-error"
                checked={isAllDeleted}
                indeterminate={isIndeterminated}
                onchange={handleChangeAll}
              />
            </th>
          {/if}
          <th>編號</th>
          <th>保養項目</th>
          <th>里程數</th>
          <th>保養日期</th>
          <th>保養總價</th>
        </tr>
      </thead>
      <tbody>
        {#each data.maintenances as maintenance, index}
          <tr>
            {#if mode === -1}
              <th class="w-[40px]">
                <input
                  type="checkbox"
                  class="checkbox checkbox-error"
                  checked={isDeleted(maintenance.id)}
                  onchange={() => handleChange(maintenance.id)}
                />
              </th>
            {/if}
            <th>
              {index + 1}
            </th>
            <td>
              {#each maintenance.maintenance_items as item}
                <span>{item.value}: ${item.price}</span><br />
              {/each}
            </td>
            <td>{maintenance.mileage}</td>
            <td>{maintenance.maintenance_date}</td>
            <td>$ {maintenance.total_price}</td>
            <td class="space-x-2">
              <button class="btn btn-secondary">
                編輯
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if mode === -1}
  <div class="flex justify-end gap-3">
    <button class="btn btn-error" onclick={toggleDelete}>取消刪除</button>
    <button class="btn btn-success" onclick={handleDelete}>確認刪除</button>
  </div>
  {/if}
</div>

<dialog class="modal" bind:this={modal}>
  <div class="modal-box">
    <h3 class="text-lg font-bold">
      {#if mode === 1}
        新增資料
      {:else if mode === 2}
        編輯資料
      {/if}
    </h3>
    <form onsubmit={handleSubmit} bind:this={form}>
      <fieldset class="my-5 fieldset gap-5">
        <div class="flex items-center">
          <legend class="fieldset-legend px-3 text-base">保養項目</legend>
          <button
            type="button"
            class="btn btn-circle btn-outline btn-sm btn-primary"
            onclick={addItem}
            ><Plus className="w-4 h-4" />
          </button>
        </div>
        {#each formData.maintenance_items as item}
          <div class="flex gap-5">
            <select
              class="select"
              id="maintenance_item_name"
              name="maintenance_item_name"
              bind:value={item.value}
            >
              <option disabled selected>請選擇保養項目</option>
              <option value="機油">機油</option>
              <option value="齒輪油">齒輪油</option>
              <option value="空氣濾清器">空氣濾清器</option>
              <option value="電池">電池</option>
              <option value="前外胎">前外胎</option>
              <option value="後外胎">後外胎</option>
              <option value="前煞車皮">前煞車皮</option>
              <option value="後煞車皮">後煞車皮</option>
              <option value="火星塞">火星塞</option>
              <option value="煞車油">煞車油</option>
              <option value="傳動皮帶">傳動皮帶</option>
              <option value="普利盤">普利盤</option>
              <option value="風葉盤">風葉盤</option>
              <option value="普利珠">普利珠</option>
              <option value="滑鍵">滑鍵</option>
              <option value="離合器">離合器</option>
              <option value="開閉盤">開閉盤</option>
            </select>
            <input
              type="number"
              id="maintenance_item_price"
              name="maintenance_item_price"
              class="input"
              placeholder="請輸入價格"
              bind:value={item.price}
            />
          </div>
        {/each}
        <label class="input w-full">
          <span class="label">里程數</span>
          <input type="number" id="mileage" name="mileage" bind:value={formData.mileage} />
        </label>
        <label class="input w-full">
          <span class="label">保養日期</span>
          <input
            type="date"
            id="maintenance_date"
            name="maintenance_date"
            bind:value={formData.maintenance_date}
          />
        </label>
        <label class="input w-full">
          <span class="label">保養總價(含工本費)</span>
          <input
            type="number"
            id="total_price"
            name="total_price"
            bind:value={formData.total_price}
          />
        </label>
      </fieldset>
      <div class="modal-action">
        <button type="button" class="btn w-24 btn-error" onclick={handleCancel}>取消</button>
        <button type="submit" class="btn w-24 btn-success">送出</button>
      </div>
    </form>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>Close</button>
  </form>
</dialog>

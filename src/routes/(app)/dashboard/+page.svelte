<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import MotorCyclesModel, { type Motorcycle } from '$lib/supabase/MotorcyclesModel';
  import type { PageProps } from './$types';
  import * as FORM_STATE from '$lib/constants/formState';
  import Pagination from '$lib/components/Pagination.svelte';

  interface FormDataType {
    id?: number | null;
    plate_number: string;
    owner_name: string;
    owner_tel: string;
    model: string;
    engine_number: string;
    front_tire_pressure: number | null;
    rear_tire_pressure: number | null;
  }

  const initialFormData: FormDataType = {
    plate_number: '',
    owner_name: '',
    owner_tel: '',
    model: '',
    engine_number: '',
    front_tire_pressure: null,
    rear_tire_pressure: null
  };
  let { data }: PageProps = $props();
  let filterOptions = $state({ type: '', searchText: '' });
  let formState = $state(FORM_STATE.INITIAL);
  let formData = $state<FormDataType>({ ...initialFormData });
  let deletedIds = $state<number[]>([]);
  let isAllDeleted = $derived(deletedIds.length === data.motorcycles.length);
  let isIndeterminated = $derived(
    deletedIds.length > 0 && deletedIds.length < data.motorcycles.length
  );
  let form;
  let modal: HTMLDialogElement;
  let currentPage = $state(1);
  let filteredMotorcycles = $derived(data.motorcycles);
  let dataSlice = $derived.by(() => {
    const start = currentPage * 10 - 10;
    const end = currentPage * 10;

    return filteredMotorcycles.slice(start, end);
  });
  let totalPages = $derived(Math.ceil(filteredMotorcycles.length / 10));

  function resetFormData() {
    formData = { ...initialFormData };
  }

  function toggleDelete() {
    if (formState === FORM_STATE.DELETE) {
      deletedIds = [];
      formState = FORM_STATE.INITIAL;
    } else {
      formState = FORM_STATE.DELETE;
    }
  }

  function handleAddClick() {
    formState = FORM_STATE.ADD;
    modal.showModal();
  }

  async function handleEditClick(id: number) {
    formState = FORM_STATE.EDIT;

    const motorcycle = data.motorcycles.find((motorcycle) => id === motorcycle.id);
    if (!motorcycle) return;

    formData = { ...initialFormData, ...motorcycle };
    modal.showModal();
  }

  function handleCancel() {
    modal.close();
    formState = FORM_STATE.INITIAL;
  }

  function fuzzyMatch(text: string, pattern: string): boolean {
    const textLower = text.toLowerCase();
    const patternLower = pattern.toLowerCase();

    let patternIndex = 0;

    for (let i = 0; i < textLower.length && patternIndex < patternLower.length; i++) {
      if (textLower[i] === patternLower[patternIndex]) {
        patternIndex++;
      }
    }

    return patternIndex === patternLower.length;
  }

  function fuzzyScore(text: string, pattern: string): number {
    const textLower = text.toLowerCase();
    const patternLower = pattern.toLowerCase();

    if (textLower.includes(patternLower)) {
      return textLower.indexOf(patternLower);
    }

    let score = 0;
    let patternIndex = 0;

    for (let i = 0; i < textLower.length && patternIndex < patternLower.length; i++) {
      if (textLower[i] === patternLower[patternIndex]) {
        patternIndex++;
      } else {
        score++;
      }
    }

    return patternIndex === patternLower.length ? score : Infinity;
  }

  function handleSearch() {
    const { type, searchText } = filterOptions;

    if (!type || !searchText.trim()) {
      filteredMotorcycles = data.motorcycles;
      return;
    }

    const searchValue = searchText.trim();

    filteredMotorcycles = data.motorcycles
      .filter((motorcycle: Motorcycle) => {
        const fieldValue = motorcycle[type as keyof Motorcycle]?.toString() || '';
        return fuzzyMatch(fieldValue, searchValue);
      })
      .sort((a: Motorcycle, b: Motorcycle) => {
        const aValue = a[type as keyof Motorcycle]?.toString() || '';
        const bValue = b[type as keyof Motorcycle]?.toString() || '';
        return fuzzyScore(aValue, searchValue) - fuzzyScore(bValue, searchValue);
      });
  }

  function handleChange(id: number) {
    deletedIds = deletedIds.includes(id)
      ? deletedIds.filter((deletedId) => deletedId !== id)
      : [...deletedIds, id];
  }

  function handleChangeAll(e: Event & { currentTarget: HTMLInputElement }) {
    if (e.currentTarget.checked) {
      deletedIds = data.motorcycles.map(({ id }) => id);
    } else {
      deletedIds = [];
    }
  }

  async function handleDelete(e: Event) {
    e.preventDefault();

    const motorCyclesModel = new MotorCyclesModel();

    try {
      await motorCyclesModel.deleteByIds(deletedIds);

      toggleDelete();

      await invalidate('motorcycles:list');
    } catch (error) {
      console.error('Error deleting data: ', error);
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const motorcyclesModel = new MotorCyclesModel();

    try {
      let result;
      if (formState === FORM_STATE.ADD) {
        const insertData = {
          ...formData,
          front_tire_pressure: Number(formData.front_tire_pressure) || 0,
          rear_tire_pressure: Number(formData.rear_tire_pressure) || 0
        };
        result = await motorcyclesModel.insert(insertData);
      } else if (formState === FORM_STATE.EDIT && formData.id) {
        const updateData = {
          plate_number: formData.plate_number,
          owner_name: formData.owner_name,
          owner_tel: formData.owner_tel,
          model: formData.model,
          engine_number: formData.engine_number,
          front_tire_pressure: Number(formData.front_tire_pressure) || 0,
          rear_tire_pressure: Number(formData.rear_tire_pressure) || 0
        };
        result = await motorcyclesModel.updateById(formData.id, updateData);
      }

      if (result?.error) throw result.error;

      modal.close();
      formState = FORM_STATE.INITIAL;

      await invalidate('motorcycles:list');
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }
</script>

<div class="flex w-full flex-col gap-10 p-10">
  <div class="card-border card bg-base-100 shadow-sm">
    <div class="card-body flex flex-row justify-between">
      <h1 class="card-title text-primary">車籍資料</h1>
      <div class="flex gap-5">
        <button class="btn btn-outline btn-primary" onclick={handleAddClick}>新增資料</button>
        <button class="btn btn-outline btn-error" onclick={toggleDelete}>刪除資料</button>
      </div>
    </div>
  </div>
  <div class="join">
    <input
      class="input join-item"
      placeholder="請輸入搜尋文字"
      bind:value={filterOptions.searchText}
    />
    <select class="select join-item w-32" bind:value={filterOptions.type}>
      <option value="">搜尋類型</option>
      <option value="plate_number">車牌號碼</option>
      <option value="owner_name">車主姓名</option>
      <option value="owner_tel">車主電話</option>
    </select>
    <button class="btn join-item btn-info" onclick={handleSearch}>Search</button>
  </div>
  <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
    <table class="table">
      <thead>
        <tr>
          {#if formState === FORM_STATE.DELETE}
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
          <th>車牌號碼</th>
          <th>車主姓名</th>
          <th>車主電話</th>
          <th>機車型號</th>
          <th>引擎號碼</th>
          <th>前輪胎壓(PSI)</th>
          <th>後輪胎壓(PSI)</th>
        </tr>
      </thead>
      <tbody>
        {#each dataSlice as motorcycle, index}
          <tr>
            {#if formState === FORM_STATE.DELETE}
              <th class="w-[40px]">
                <input
                  type="checkbox"
                  class="checkbox checkbox-error"
                  checked={deletedIds.includes(motorcycle.id)}
                  onchange={() => handleChange(motorcycle.id)}
                />
              </th>
            {/if}
            <th>{index + 1}</th>
            <td>{motorcycle.plate_number}</td>
            <td>{motorcycle.owner_name}</td>
            <td>{motorcycle.owner_tel}</td>
            <td>{motorcycle.model}</td>
            <td>{motorcycle.engine_number}</td>
            <td>{motorcycle.front_tire_pressure}</td>
            <td>{motorcycle.rear_tire_pressure}</td>
            <td>
              <div class="flex flex-wrap gap-2">
                <button class="btn btn-secondary" onclick={() => handleEditClick(motorcycle.id)}>
                  編輯
                </button>
                <button
                  class="btn btn-accent"
                  onclick={async () => await goto(`/dashboard/${motorcycle.id}`)}>保養紀錄</button
                >
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if formState === FORM_STATE.DELETE}
    <div class="flex justify-end gap-3">
      <button class="btn btn-error" onclick={toggleDelete}>取消刪除</button>
      <button class="btn btn-success" onclick={handleDelete}>確認刪除</button>
    </div>
  {/if}
  <div class="flex w-full justify-center">
    <Pagination {totalPages} bind:currentPage />
  </div>
</div>

<dialog class="modal" bind:this={modal} onclose={resetFormData}>
  <div class="modal-box">
    <h3 class="text-lg font-bold">
      {#if formState === FORM_STATE.ADD}
        新增資料
      {:else if formState === FORM_STATE.EDIT}
        編輯資料
      {/if}
    </h3>
    <form onsubmit={handleSubmit} bind:this={form}>
      <fieldset class="my-5 fieldset gap-5">
        <label class="input w-full">
          <span class="label">車牌號碼</span>
          <input
            type="text"
            id="plate_number"
            name="plate_number"
            bind:value={formData.plate_number}
          />
        </label>
        <label class="input w-full">
          <span class="label">車主姓名</span>
          <input type="text" id="owner_name" name="owner_name" bind:value={formData.owner_name} />
        </label>
        <label class="input w-full">
          <span class="label">車主電話</span>
          <input type="text" id="owner_tel" name="owner_tel" bind:value={formData.owner_tel} />
        </label>
        <label class="input w-full">
          <span class="label">機車型號</span>
          <input type="text" id="model" name="model" bind:value={formData.model} />
        </label>
        <label class="input w-full">
          <span class="label">引擎號碼</span>
          <input
            type="text"
            id="engine_number"
            name="engine_number"
            bind:value={formData.engine_number}
          />
        </label>
        <label class="input w-full">
          <span class="label">前輪胎壓(PSI)</span>
          <input
            type="text"
            id="front_tire_pressure"
            name="front_tire_pressure"
            bind:value={formData.front_tire_pressure}
          />
        </label>
        <label class="input w-full">
          <span class="label">後輪胎壓(PSI)</span>
          <input
            type="text"
            id="rear_tire_pressure"
            name="rear_tire_pressure"
            bind:value={formData.rear_tire_pressure}
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

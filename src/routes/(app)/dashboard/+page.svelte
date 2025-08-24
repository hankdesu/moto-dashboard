<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import MotorcycleForm, {
    type FormMethods,
    type MotorcycleData
  } from '$lib/components/MotorcycleForm.svelte';
  import MotorCyclesModel, { type Motorcycle } from '$lib/supabase/MotorcyclesModel';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  let formMethods: FormMethods | undefined = $state();
  let mode = $state(0);
  let filterOptions = $state({ type: '', searchText: '' });
  let editId: number | null = $state(null);
  let modal: HTMLDialogElement;
  let filteredMotorcycles = $state(data.motorcycles);

  $effect(() => {
    filteredMotorcycles = data.motorcycles;
  });

  function handleAddClick() {
    mode = 1;
    editId = null;
    modal.showModal();

    if (formMethods) {
      formMethods.reset();
    }
  }

  async function handleEditClick(id: number) {
    mode = 2;
    editId = id;
    modal.showModal();

    const motorcycle = data.motorcycles.find((motorcycle) => id === motorcycle.id);

    if (formMethods && motorcycle) {
      formMethods.reset();
      formMethods.setFormData(motorcycle);
    }
  }

  function handleCancel() {
    modal.close();
    mode = 0;
    editId = null;
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

  async function handleSubmit(motorcycleData: Partial<MotorcycleData>) {
    const motorcyclesModel = new MotorCyclesModel();

    try {
      let result;
      if (mode === 1) {
        result = await motorcyclesModel.insert(motorcycleData);
      } else if (mode === 2 && editId) {
        result = await motorcyclesModel.updateById(editId, motorcycleData);
      }

      if (result?.error) throw result.error;

      modal.close();
      mode = 0;
      editId = null;

      if (formMethods) {
        formMethods.reset();
      }

      await invalidate('motorcycles:list');
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }
</script>

<div class="flex w-full flex-col gap-10 p-10">
  <div class="card bg-neutral">
    <div class="card-body flex flex-row justify-between">
      <h1 class="card-title text-primary">車籍資料</h1>
      <button class="btn btn-outline btn-primary" onclick={handleAddClick}>新增資料</button>
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
        {#each filteredMotorcycles as motorcycle, index}
          <tr>
            <th>{index + 1}</th>
            <td>{motorcycle.plate_number}</td>
            <td>{motorcycle.owner_name}</td>
            <td>{motorcycle.owner_tel}</td>
            <td>{motorcycle.model}</td>
            <td>{motorcycle.engine_number}</td>
            <td>{motorcycle.front_tire_pressure}</td>
            <td>{motorcycle.rear_tire_pressure}</td>
            <td class="space-x-2">
              <button class="btn btn-secondary" onclick={() => handleEditClick(motorcycle.id)}>
                編輯
              </button>
              <button
                class="btn btn-accent"
                onclick={async () => await goto(`/dashboard/${motorcycle.id}`)}>保養紀錄</button
              >
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<dialog id="my_modal_1" class="modal" bind:this={modal}>
  <div class="modal-box">
    <h3 class="text-lg font-bold">
      {#if mode === 1}
        新增資料
      {:else if mode === 2}
        編輯資料
      {/if}
    </h3>
    <MotorcycleForm onSubmit={handleSubmit} onCancel={handleCancel} bind:formMethods />
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>Close</button>
  </form>
</dialog>

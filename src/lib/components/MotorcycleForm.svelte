<script lang="ts">
  export interface MotorcycleData {
    plate_number: string;
    owner_name: string;
    owner_tel: string;
    model: string;
    engine_number: string;
    front_tire_pressure: number;
    rear_tire_pressure: number;
  }

  export interface FormMethods {
    reset: () => void;
    getFormData: () => MotorcycleData | null;
    setFormData: (data: Partial<MotorcycleData>) => void;
  }

  interface Props {
    onSubmit?: (data: MotorcycleData) => Promise<void>;
    onCancel?: () => void;
    isSubmitting?: boolean;
    formMethods?: FormMethods;
  }

  let form: HTMLFormElement;
  let { onSubmit, onCancel, isSubmitting = false, formMethods = $bindable() }: Props = $props();

  formMethods = {
    reset: () => {
      if (form) {
        form.reset();
      }
    },

    getFormData: () => {
      if (!form) return null;

      const formData = new FormData(form);
      return {
        plate_number: formData.get('plate_number') as string,
        owner_name: formData.get('owner_name') as string,
        owner_tel: formData.get('owner_tel') as string,
        model: formData.get('model') as string,
        engine_number: formData.get('engine_number') as string,
        front_tire_pressure: Number(formData.get('front_tire_pressure')),
        rear_tire_pressure: Number(formData.get('rear_tire_pressure'))
      };
    },

    setFormData: (data: Partial<MotorcycleData>) => {
      if (!form) return;

      Object.entries(data).forEach(([key, value]) => {
        const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
        if (input) {
          input.value = value?.toString() || '';
        }
      });
    }
  };

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    if (!formMethods) return;

    const motorcycleData = formMethods.getFormData();

    if (motorcycleData && onSubmit) {
      await onSubmit(motorcycleData);
    }
  }

  function handleCancel() {
    if (onCancel) {
      onCancel();
    }
  }
</script>

<form onsubmit={handleSubmit} bind:this={form}>
  <fieldset class="my-5 fieldset gap-5">
    <label class="input w-full">
      <span class="label">車牌號碼</span>
      <input type="text" id="plate_number" name="plate_number" />
    </label>
    <label class="input w-full">
      <span class="label">車主姓名</span>
      <input type="text" id="owner_name" name="owner_name" />
    </label>
    <label class="input w-full">
      <span class="label">車主電話</span>
      <input type="text" id="owner_tel" name="owner_tel" />
    </label>
    <label class="input w-full">
      <span class="label">機車型號</span>
      <input type="text" id="model" name="model" />
    </label>
    <label class="input w-full">
      <span class="label">引擎號碼</span>
      <input type="text" id="engine_number" name="engine_number" />
    </label>
    <label class="input w-full">
      <span class="label">前輪胎壓(PSI)</span>
      <input type="number" id="front_tire_pressure" name="front_tire_pressure" />
    </label>
    <label class="input w-full">
      <span class="label">後輪胎壓(PSI)</span>
      <input type="number" id="rear_tire_pressure" name="rear_tire_pressure" />
    </label>
  </fieldset>
  <div class="modal-action">
    <button type="button" class="btn w-24 btn-error" onclick={handleCancel}>取消</button>
    <button type="submit" class="btn w-24 btn-success">送出</button>
  </div>
</form>

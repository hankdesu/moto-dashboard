import type { Component } from 'svelte';

interface DialogOptions {
  closeOnCorner?: boolean;
  closeOnBackdrop?: boolean;
}

let component = $state<Component | null>(null);
let props = $state<Record<string, unknown>>({});
let options = $state<DialogOptions>({ closeOnCorner: false, closeOnBackdrop: true });
let dialogRef: HTMLDialogElement | null = null;

export const dialogStore = {
  get component() {
    return component;
  },
  get props() {
    return props;
  },
  get options() {
    return options;
  },
  setDialog(dialog: HTMLDialogElement) {
    dialogRef = dialog;
  },
  show(
    content: Component,
    contentProps: Record<string, unknown> = {},
    dialogOptions: DialogOptions = {}
  ) {
    component = content;
    props = contentProps;
    options = { ...options, ...dialogOptions };
    dialogRef?.showModal();
  },
  hide() {
    dialogRef?.close();

    setTimeout(() => {
      component = null;
      props = {};
    }, 300);
  }
};

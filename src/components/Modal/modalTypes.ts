import type { VNode } from 'vue';
import type { ModalProps } from './Modal.vue';

type ConfirmVariant = 'primary' | 'danger';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

export interface ShowModalOptions {
  title?: string;
  description?: string;
  children: VNode | VNode[];
  footer?: VNode | VNode[];
  size?: ModalProps['size'];
  closeOnBackdropClick?: boolean;
}

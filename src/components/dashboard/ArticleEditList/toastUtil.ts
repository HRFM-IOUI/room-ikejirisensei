import { toast as hotToast } from "react-hot-toast";

export function showSuccess(message: string) {
  hotToast.success(message, { duration: 3500 });
}
export function showError(message: string) {
  hotToast.error(message, { duration: 4000 });
}
export function showInfo(message: string) {
  hotToast(message, { duration: 3500 });
}

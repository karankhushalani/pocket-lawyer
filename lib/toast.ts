import Toast from "react-native-toast-message";

export function showSuccess(title: string, subtitle?: string) {
  Toast.show({ type: "success", text1: title, text2: subtitle });
}

export function showError(title: string, subtitle?: string) {
  Toast.show({ type: "error", text1: title, text2: subtitle });
}

export function showInfo(title: string, subtitle?: string) {
  Toast.show({ type: "info", text1: title, text2: subtitle });
}

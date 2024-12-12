import { toastApi } from "@/components/ui/toaster";

const isBrowser = typeof window !== 'undefined';

export default function request(
  input: string | URL | globalThis.Request,
  init?: RequestInit
) {
  return fetch(input, init)
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      if (res.success) {
        return res.data;
      } else {
        if (res.message && isBrowser) {
          toastApi.error(res.message);
        }
        throw res;
      }
    });
}

export const formatSuccess = (params: { data?: any; message?: string }) => {
  return { success: true, ...params };
};

export const formateError = (params: { code?: string; message?: string }) => {
  return { success: false, ...params };
};
